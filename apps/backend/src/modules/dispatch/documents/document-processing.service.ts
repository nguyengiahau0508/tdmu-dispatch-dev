import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Document, DocumentTypeEnum } from './entities/document.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { Role } from 'src/common/enums/role.enums';
import { WorkflowInstancesService } from 'src/modules/workflow/workflow-instances/workflow-instances.service';
import { WorkflowActionLogsService } from 'src/modules/workflow/workflow-action-logs/workflow-action-logs.service';
import { ActionType } from 'src/modules/workflow/workflow-action-logs/entities/workflow-action-log.entity';
import { PriorityEnum } from './dto/document-processing/document-processing-info.output';

export interface DocumentProcessingInfo {
  documentId: number;
  documentTitle: string;
  documentType: string;
  documentCategory: string;
  status: string;
  createdAt: Date;
  workflowInstanceId?: number;
  currentStepId?: number;
  currentStepName?: string;
  workflowStatus?: string;
  requiresAction: boolean;
  actionType?: string;
  deadline?: Date;
  priority: PriorityEnum;
}

export interface DocumentActionInput {
  documentId: number;
  actionType: ActionType;
  notes?: string;
  transferToUserId?: number;
}

@Injectable()
export class DocumentProcessingService {
  constructor(
    @InjectRepository(Document)
    private readonly documentRepository: Repository<Document>,
    private readonly workflowInstancesService: WorkflowInstancesService,
    private readonly workflowActionLogsService: WorkflowActionLogsService,
  ) {}

  /**
   * Lấy danh sách documents cần xử lý của user
   */
  async getDocumentsForProcessing(user: User): Promise<DocumentProcessingInfo[]> {
    console.log('=== GET DOCUMENTS FOR PROCESSING ===');
    console.log('User:', user.id, user.email, user.roles);

    // Lấy tất cả workflow instances đang hoạt động
    const activeWorkflows = await this.workflowInstancesService.findAll();
    
    // Lọc workflows mà user có quyền xử lý
    const userWorkflows = activeWorkflows.filter(workflow => {
      // Kiểm tra xem user có phải là người được assign cho step hiện tại không
      if (!workflow.currentStep) return false;
      
      // Kiểm tra permissions dựa trên role
      return this.canUserProcessStep(user, workflow.currentStep);
    });

    // Lấy thông tin documents tương ứng
    const documentIds = userWorkflows.map(w => w.documentId).filter(id => id);
    
    // Kiểm tra nếu không có document nào
    if (documentIds.length === 0) {
      console.log('No documents found for processing');
      return [];
    }

    const documents = await this.documentRepository.find({
      where: { id: In(documentIds) },
      relations: ['documentCategory'],
    });

    // Map thành DocumentProcessingInfo
    const processingInfo: DocumentProcessingInfo[] = userWorkflows.map(workflow => {
      const document = documents.find(d => d.id === workflow.documentId);
      if (!document) return null;

      return {
        documentId: document.id,
        documentTitle: document.title,
        documentType: document.documentType,
        documentCategory: document.documentCategory?.name || 'N/A',
        status: document.status || '',
        createdAt: document.createdAt,
        workflowInstanceId: workflow.id,
        currentStepId: workflow.currentStepId,
        currentStepName: workflow.currentStep?.name,
        workflowStatus: workflow.status,
        requiresAction: true,
        actionType: this.getAvailableActions(user, workflow.currentStep),
        deadline: this.calculateDeadline(workflow.createdAt),
        priority: this.calculatePriority(document, workflow),
      };
    }).filter(Boolean) as DocumentProcessingInfo[];

    console.log(`Found ${processingInfo.length} documents for processing`);
    return processingInfo;
  }

  /**
   * Lấy danh sách documents đã xử lý của user
   */
  async getProcessedDocuments(user: User): Promise<DocumentProcessingInfo[]> {
    console.log('=== GET PROCESSED DOCUMENTS ===');
    console.log('User:', user.id, user.email);

    // Lấy action logs của user
    const userActionLogs = await this.workflowActionLogsService.findByUser(user.id);
    
    // Lấy unique document IDs từ action logs
    const documentIds = [...new Set(userActionLogs.map(log => log.instance?.documentId).filter(Boolean))];
    
    if (documentIds.length === 0) {
      console.log('No processed documents found');
      return [];
    }

    // Lấy documents
    const documents = await this.documentRepository.find({
      where: { id: In(documentIds) },
      relations: ['documentCategory'],
    });

    // Lấy workflow instances
    const workflowInstances = await this.workflowInstancesService.findAll();
    const documentWorkflows = workflowInstances.filter(w => documentIds.includes(w.documentId));

    // Map thành DocumentProcessingInfo
    const processedInfo: DocumentProcessingInfo[] = documentWorkflows.map(workflow => {
      const document = documents.find(d => d.id === workflow.documentId);
      if (!document) return null;

      const userActions = userActionLogs.filter(log => log.instanceId === workflow.id);
      const lastAction = userActions[userActions.length - 1];

      return {
        documentId: document.id,
        documentTitle: document.title,
        documentType: document.documentType,
        documentCategory: document.documentCategory?.name || 'N/A',
        status: document.status || '',
        createdAt: document.createdAt,
        workflowInstanceId: workflow.id,
        currentStepId: workflow.currentStepId,
        currentStepName: workflow.currentStep?.name,
        workflowStatus: workflow.status,
        requiresAction: false,
        actionType: lastAction?.actionType,
        deadline: this.calculateDeadline(workflow.createdAt),
        priority: this.calculatePriority(document, workflow),
      };
    }).filter(Boolean) as DocumentProcessingInfo[];

    console.log(`Found ${processedInfo.length} processed documents`);
    return processedInfo;
  }

  /**
   * Lấy danh sách documents khẩn cấp
   */
  async getUrgentDocuments(user: User): Promise<DocumentProcessingInfo[]> {
    console.log('=== GET URGENT DOCUMENTS ===');
    console.log('User:', user.id, user.email);

    const allDocuments = await this.getDocumentsForProcessing(user);
    
    // Lọc documents khẩn cấp (priority URGENT hoặc overdue)
    const urgentDocuments = allDocuments.filter(doc => {
      return doc.priority === PriorityEnum.URGENT || 
             (doc.deadline && new Date() > doc.deadline);
    });

    console.log(`Found ${urgentDocuments.length} urgent documents`);
    return urgentDocuments;
  }

  /**
   * Lấy documents theo priority
   */
  async getDocumentsByPriority(user: User, priority: string): Promise<DocumentProcessingInfo[]> {
    console.log('=== GET DOCUMENTS BY PRIORITY ===');
    console.log('User:', user.id, user.email, 'Priority:', priority);

    const allDocuments = await this.getDocumentsForProcessing(user);
    
    const priorityDocuments = allDocuments.filter(doc => {
      return doc.priority === priority;
    });

    console.log(`Found ${priorityDocuments.length} documents with priority ${priority}`);
    return priorityDocuments;
  }

  /**
   * Xử lý document action
   */
  async processDocumentAction(
    input: DocumentActionInput,
    user: User,
  ): Promise<any> {
    console.log('=== PROCESS DOCUMENT ACTION ===');
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

    // Find workflow instance
    const workflows = await this.workflowInstancesService.findAll();
    const workflow = workflows.find(w => w.documentId === input.documentId && w.status === 'IN_PROGRESS');

    if (!workflow) {
      throw new BadRequestException('No active workflow found for this document');
    }

    // Check if user can process current step
    if (!this.canUserProcessStep(user, workflow.currentStep)) {
      throw new BadRequestException('User does not have permission to process this step');
    }

    // Execute workflow action
    const actionInput = {
      instanceId: workflow.id,
      stepId: workflow.currentStepId,
      actionType: input.actionType,
      note: input.notes,
      metadata: input.transferToUserId ? JSON.stringify({ transferToUserId: input.transferToUserId }) : undefined,
    };

    const result = await this.workflowInstancesService.executeAction(actionInput, user);

    // Update document status if workflow is completed
    if (result.status === 'COMPLETED') {
      await this.documentRepository.update(document.id, {
        status: 'completed',
      });
    }

    return {
      documentId: document.id,
      workflowInstanceId: workflow.id,
      actionType: input.actionType,
      result: result,
      message: `Document action ${input.actionType} executed successfully`,
    };
  }

  /**
   * Lấy thống kê xử lý document của user
   */
  async getProcessingStatistics(user: User): Promise<any> {
    const pendingDocuments = await this.getDocumentsForProcessing(user);
    const processedDocuments = await this.getProcessedDocuments(user);

    const totalDocuments = pendingDocuments.length + processedDocuments.length;
    const completedDocuments = processedDocuments.filter(d => d.workflowStatus === 'COMPLETED').length;
    const pendingCount = pendingDocuments.length;

    return {
      totalDocuments,
      pendingCount,
      completedCount: completedDocuments,
      inProgressCount: processedDocuments.length - completedDocuments,
      completionRate: totalDocuments > 0 ? (completedDocuments / totalDocuments) * 100 : 0,
    };
  }

  /**
   * Kiểm tra user có thể xử lý step không
   */
  private canUserProcessStep(user: User, step: any): boolean {
    if (!step) return false;

    // Kiểm tra role-based permissions
    const userRoles = user.roles;
    
    // SYSTEM_ADMIN có thể xử lý tất cả
    if (userRoles.includes(Role.SYSTEM_ADMIN)) return true;

    // DEPARTMENT_HEAD có thể xử lý steps trong department của họ
    if (userRoles.includes(Role.DEPARTMENT_HEAD)) {
      // Logic kiểm tra department
      return true;
    }

    // CLERK có thể xử lý các steps liên quan đến văn thư
    if (userRoles.includes(Role.CLERK)) {
      return step.name?.toLowerCase().includes('văn thư') || 
             step.name?.toLowerCase().includes('clerical') ||
             step.name?.toLowerCase().includes('document');
    }

    // DEPARTMENT_STAFF có thể xử lý steps cơ bản
    if (userRoles.includes(Role.DEPARTMENT_STAFF)) {
      return step.name?.toLowerCase().includes('approve') ||
             step.name?.toLowerCase().includes('review') ||
             step.name?.toLowerCase().includes('phê duyệt');
    }

    return false;
  }

  /**
   * Lấy các actions có sẵn cho user
   */
  private getAvailableActions(user: User, step: any): string {
    if (!step) return '';

    const userRoles = user.roles;
    
    if (userRoles.includes(Role.SYSTEM_ADMIN)) {
      return 'APPROVE,REJECT,TRANSFER,COMPLETE';
    }

    if (userRoles.includes(Role.DEPARTMENT_HEAD)) {
      return 'APPROVE,REJECT,TRANSFER';
    }

    if (userRoles.includes(Role.CLERK)) {
      return 'APPROVE,REJECT,TRANSFER';
    }

    if (userRoles.includes(Role.DEPARTMENT_STAFF)) {
      return 'APPROVE,REJECT';
    }

    return '';
  }

  /**
   * Tính toán deadline
   */
  private calculateDeadline(createdAt: Date): Date {
    // Mặc định deadline là 7 ngày sau khi tạo
    const deadline = new Date(createdAt);
    deadline.setDate(deadline.getDate() + 7);
    return deadline;
  }

  /**
   * Tính toán priority
   */
  private calculatePriority(document: Document, workflow: any): PriorityEnum {
    const now = new Date();
    const deadline = this.calculateDeadline(workflow.createdAt);
    const daysUntilDeadline = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilDeadline < 0) return PriorityEnum.URGENT;
    if (daysUntilDeadline <= 1) return PriorityEnum.HIGH;
    if (daysUntilDeadline <= 3) return PriorityEnum.MEDIUM;
    return PriorityEnum.LOW;
  }
}
