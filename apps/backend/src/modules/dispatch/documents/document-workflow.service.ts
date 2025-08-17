import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document, DocumentTypeEnum, DocumentStatus } from './entities/document.entity';
import { WorkflowInstancesService } from 'src/modules/workflow/workflow-instances/workflow-instances.service';
import { WorkflowTemplatesService } from 'src/modules/workflow/workflow-templates/workflow-templates.service';
import { User } from 'src/modules/users/entities/user.entity';
import { Role } from 'src/common/enums/role.enums';
import { ActionType } from 'src/modules/workflow/workflow-action-logs/entities/workflow-action-log.entity';

export interface AssignWorkflowInput {
  documentId: number;
  templateId: number;
  notes?: string;
}

export interface DocumentWorkflowInfo {
  documentId: number;
  documentTitle: string;
  documentType: string;
  workflowInstanceId?: number;
  workflowStatus?: string;
  currentStep?: string;
  hasActiveWorkflow: boolean;
}

@Injectable()
export class DocumentWorkflowService {
  constructor(
    @InjectRepository(Document)
    private readonly documentRepository: Repository<Document>,
    private readonly workflowInstancesService: WorkflowInstancesService,
    private readonly workflowTemplatesService: WorkflowTemplatesService,
  ) {}

  /**
   * Gán workflow cho document
   */
  async assignWorkflowToDocument(
    input: AssignWorkflowInput,
    user: User,
  ): Promise<any> {
    console.log('=== ASSIGN WORKFLOW TO DOCUMENT ===');
    console.log('Input:', input);
    console.log('User:', user.id, user.email);

    // Validate document exists
    const document = await this.documentRepository.findOne({
      where: { id: input.documentId },
      relations: ['documentCategory'],
    });

    if (!document) {
      throw new NotFoundException(`Document with ID ${input.documentId} not found`);
    }

    console.log('Document found:', {
      id: document.id,
      title: document.title,
      type: document.documentType,
      status: document.status,
    });

    // Check if document already has an active workflow
    const existingWorkflow = await this.getDocumentWorkflow(document.id);
    if (existingWorkflow?.hasActiveWorkflow) {
      throw new BadRequestException(
        `Document already has an active workflow (ID: ${existingWorkflow.workflowInstanceId})`,
      );
    }

    // Validate template exists and is active
    const template = await this.workflowTemplatesService.findOne(input.templateId);
    if (!template.isActive) {
      throw new BadRequestException('Selected workflow template is not active');
    }

    // Check user permissions for this template
    const allowedRoles = this.getTemplateAllowedRoles(template.name);
    if (!allowedRoles.some(role => user.roles.includes(role))) {
      throw new BadRequestException(
        `User does not have permission to assign workflow template: ${template.name}`,
      );
    }

    // Create workflow instance
    const workflowInput = {
      templateId: input.templateId,
      documentId: input.documentId,
      notes: input.notes || `Workflow assigned for document: ${document.title}`,
    };

    const workflowInstance = await this.workflowInstancesService.create(
      workflowInput,
      user,
    );

    // Update document status to 'processing'
    await this.documentRepository.update(document.id, {
      status: DocumentStatus.PROCESSING,
    });

    console.log('Workflow assigned successfully:', {
      documentId: document.id,
      workflowInstanceId: workflowInstance.id,
      status: workflowInstance.status,
    });

    return {
      documentId: document.id,
      workflowInstanceId: workflowInstance.id,
      workflowStatus: workflowInstance.status,
      currentStep: workflowInstance.currentStep?.name,
      message: 'Workflow assigned successfully',
    };
  }

  /**
   * Lấy thông tin workflow của document
   */
  async getDocumentWorkflow(documentId: number): Promise<DocumentWorkflowInfo | null> {
    const document = await this.documentRepository.findOne({
      where: { id: documentId },
      relations: ['documentCategory'],
    });

    if (!document) {
      return null;
    }

    // Find active workflow for this document
    const workflows = await this.workflowInstancesService.findAll();
    const activeWorkflow = workflows.find(
      w => w.documentId === documentId && w.status === 'IN_PROGRESS',
    );

    return {
      documentId: document.id,
      documentTitle: document.title,
      documentType: document.documentType,
      workflowInstanceId: activeWorkflow?.id,
      workflowStatus: activeWorkflow?.status,
      currentStep: activeWorkflow?.currentStep?.name,
      hasActiveWorkflow: !!activeWorkflow,
    };
  }

  /**
   * Lấy danh sách documents cần gán workflow
   */
  async getDocumentsNeedingWorkflow(): Promise<Document[]> {
    return this.documentRepository.find({
      where: [
        { status: DocumentStatus.DRAFT, documentType: DocumentTypeEnum.OUTGOING },
        { status: DocumentStatus.PENDING, documentType: DocumentTypeEnum.OUTGOING },
      ],
      relations: ['documentCategory'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Lấy danh sách workflow templates phù hợp cho document type
   */
  async getSuitableTemplates(documentType: string): Promise<any[]> {
    const allTemplates = await this.workflowTemplatesService.findAll();
    
    // Filter templates based on document type
    return allTemplates.filter(template => {
      if (!template.isActive) return false;
      
      // Simple mapping logic - can be enhanced based on business rules
      const templateName = template.name.toLowerCase();
      
      switch (documentType) {
        case 'OUTGOING':
          return templateName.includes('outgoing') || 
                 templateName.includes('approval') || 
                 templateName.includes('phê duyệt');
        case 'INCOMING':
          return templateName.includes('incoming') || 
                 templateName.includes('processing') || 
                 templateName.includes('xử lý');
        case 'INTERNAL':
          return templateName.includes('internal') || 
                 templateName.includes('nội bộ');
        default:
          return true;
      }
    });
  }

  /**
   * Xóa workflow khỏi document
   */
  async removeWorkflowFromDocument(documentId: number, user: User): Promise<any> {
    const document = await this.documentRepository.findOne({
      where: { id: documentId },
    });

    if (!document) {
      throw new NotFoundException(`Document with ID ${documentId} not found`);
    }

    // Find and cancel active workflow
    const workflows = await this.workflowInstancesService.findAll();
    const activeWorkflow = workflows.find(
      w => w.documentId === documentId && w.status === 'IN_PROGRESS',
    );

    if (activeWorkflow) {
      // Cancel the workflow
      await this.workflowInstancesService.executeAction(
        {
          instanceId: activeWorkflow.id,
          stepId: activeWorkflow.currentStepId,
          actionType: ActionType.CANCEL,
          note: 'Workflow removed by user',
        },
        user,
      );
    }

    // Update document status back to draft
    await this.documentRepository.update(documentId, {
      status: DocumentStatus.DRAFT,
    });

    return {
      documentId,
      message: 'Workflow removed successfully',
    };
  }

  private getTemplateAllowedRoles(templateName: string): Role[] {
    // Define which roles can assign which templates
    const templateRoleMap: Record<string, Role[]> = {
      'Quy trình phê duyệt văn bản thông thường': [Role.CLERK, Role.DEPARTMENT_STAFF, Role.SYSTEM_ADMIN],
      'Quy trình xử lý văn bản đến': [Role.CLERK, Role.SYSTEM_ADMIN],
      'Quy trình nội bộ': [Role.DEPARTMENT_STAFF, Role.SYSTEM_ADMIN],
    };

    return templateRoleMap[templateName] || [Role.SYSTEM_ADMIN];
  }
}
