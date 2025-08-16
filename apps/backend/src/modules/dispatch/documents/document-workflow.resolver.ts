import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from 'src/auth/guards/gql-auth.guard';
import { CurrentUser } from 'src/common/decorators/user.decorator';
import { User } from 'src/modules/users/entities/user.entity';
import { DocumentWorkflowService, AssignWorkflowInput } from './document-workflow.service';
import { createResponseMetadata } from 'src/common/helpers/metadata.helper';
import { HttpStatus } from '@nestjs/common';
import { AssignWorkflowOutput } from './dto/document-workflow/assign-workflow.output';
import { RemoveWorkflowOutput } from './dto/document-workflow/remove-workflow.output';
import { DocumentsNeedingWorkflowResponse } from './dto/document-workflow/document-needing-workflow.output';
import { DocumentWorkflowInfo } from './dto/document-workflow/document-workflow-info.output';
import { SuitableWorkflowTemplatesResponse } from './dto/document-workflow/suitable-workflow-template.output';

@Resolver()
@UseGuards(GqlAuthGuard)
export class DocumentWorkflowResolver {
  constructor(private readonly documentWorkflowService: DocumentWorkflowService) {}

  @Mutation(() => AssignWorkflowOutput, { description: 'Gán workflow cho document' })
  async assignWorkflowToDocument(
    @Args('documentId', { type: () => Int }) documentId: number,
    @Args('templateId', { type: () => Int }) templateId: number,
    @Args('notes', { nullable: true }) notes?: string,
    @CurrentUser() user?: User,
  ): Promise<AssignWorkflowOutput> {
    console.log('=== ASSIGN WORKFLOW RESOLVER ===');
    console.log('User:', user?.id, user?.email);
    console.log('Document ID:', documentId);
    console.log('Template ID:', templateId);

    if (!user) {
      throw new Error('User not authenticated');
    }

    const input: AssignWorkflowInput = {
      documentId,
      templateId,
      notes,
    };

    const result = await this.documentWorkflowService.assignWorkflowToDocument(input, user);
    
    return {
      metadata: createResponseMetadata(
        HttpStatus.OK,
        'Gán workflow thành công',
      ),
      data: result,
    };
  }

  @Query(() => DocumentsNeedingWorkflowResponse, { description: 'Lấy danh sách documents cần gán workflow' })
  async documentsNeedingWorkflow(@CurrentUser() user?: User): Promise<DocumentsNeedingWorkflowResponse> {
    if (!user) {
      throw new Error('User not authenticated');
    }

    const documents = await this.documentWorkflowService.getDocumentsNeedingWorkflow();
    
    const mappedDocuments = documents.map(doc => ({
      id: doc.id,
      title: doc.title,
      documentType: doc.documentType,
      status: doc.status,
      documentCategory: doc.documentCategory?.name,
      createdAt: doc.createdAt,
    }));

    return {
      documents: mappedDocuments,
    };
  }

  @Query(() => DocumentWorkflowInfo, { description: 'Lấy thông tin workflow của document' })
  async documentWorkflowInfo(
    @Args('documentId', { type: () => Int }) documentId: number,
    @CurrentUser() user?: User,
  ): Promise<DocumentWorkflowInfo> {
    if (!user) {
      throw new Error('User not authenticated');
    }

    const workflowInfo = await this.documentWorkflowService.getDocumentWorkflow(documentId);
    
    if (!workflowInfo) {
      throw new Error(`Document with ID ${documentId} not found`);
    }

    return workflowInfo;
  }

  @Query(() => SuitableWorkflowTemplatesResponse, { description: 'Lấy danh sách workflow templates phù hợp' })
  async suitableWorkflowTemplates(
    @Args('documentType') documentType: string,
    @CurrentUser() user?: User,
  ): Promise<SuitableWorkflowTemplatesResponse> {
    if (!user) {
      throw new Error('User not authenticated');
    }

    const templates = await this.documentWorkflowService.getSuitableTemplates(documentType);
    
    const mappedTemplates = templates.map(template => ({
      id: template.id,
      name: template.name,
      description: template.description,
      isActive: template.isActive,
    }));

    return {
      templates: mappedTemplates,
    };
  }

  @Mutation(() => RemoveWorkflowOutput, { description: 'Xóa workflow khỏi document' })
  async removeWorkflowFromDocument(
    @Args('documentId', { type: () => Int }) documentId: number,
    @CurrentUser() user?: User,
  ): Promise<RemoveWorkflowOutput> {
    if (!user) {
      throw new Error('User not authenticated');
    }

    const result = await this.documentWorkflowService.removeWorkflowFromDocument(documentId, user);
    
    return {
      metadata: createResponseMetadata(
        HttpStatus.OK,
        'Xóa workflow thành công',
      ),
      data: result,
    };
  }

  @Query(() => [DocumentWorkflowInfo], { description: 'Lấy danh sách documents với workflow status' })
  async documentsWithWorkflowStatus(@CurrentUser() user?: User): Promise<DocumentWorkflowInfo[]> {
    if (!user) {
      throw new Error('User not authenticated');
    }

    // This would need to be implemented in the service
    // For now, return empty array
    return [];
  }
}
