import { Resolver, Query, Mutation, Args, Int, ResolveField, Parent, ObjectType, Field } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { FileUpload, GraphQLUpload } from 'graphql-upload-ts';
import { DocumentsService } from './documents.service';
import { DocumentProcessingService } from './document-processing.service';
import { Document } from './entities/document.entity';
import { WorkflowInstancesService } from 'src/modules/workflow/workflow-instances/workflow-instances.service';
import { CreateDocumentInput } from './dto/create-document/create-document.input';
import { UpdateDocumentInput } from './dto/update-document/update-document.input';
import { GetDocumentsPaginatedInput } from './dto/get-documents-paginated/get-documents-paginated.input';
import { DocumentActionInput } from './dto/document-processing/document-action.input';
import { GqlAuthGuard } from 'src/auth/guards/gql-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { CurrentUser } from 'src/common/decorators/user.decorator';
import { User } from 'src/modules/users/entities/user.entity';
import { DocumentStatus, DocumentTypeEnum, DocumentPriority } from './entities/document.entity';
import { Role } from 'src/common/enums/role.enums';

// Tạo response types
import { ApiResponse } from 'src/common/graphql/api-response.dto';
import { Metadata } from 'src/common/graphql/metadata.dto';

// Document processing DTOs
import { 
  DocumentProcessingInfo, 
  DocumentsForProcessingResponse, 
  ProcessedDocumentsResponse,
  PriorityEnum
} from './dto/document-processing/document-processing-info.output';
import { 
  ProcessingStatistics, 
  ProcessingStatisticsResponse 
} from './dto/document-processing/processing-statistics.output';
import { 
  DocumentProcessingHistoryItem,
  DocumentProcessingHistoryResponse 
} from './dto/document-processing/document-processing-history.output';
import { GetDocumentsPaginatedResponse } from './dto/get-documents-paginated/get-documents-paginated.response';

@ObjectType()
export class DocumentResponse extends ApiResponse(Document) {}

@ObjectType()
export class DocumentsResponse {
  @Field(() => Metadata)
  metadata: Metadata;

  @Field(() => [Document])
  data: Document[];
}

@ObjectType()
export class DocumentStatistics {
  @Field(() => Int)
  pending: number;

  @Field(() => Int)
  processing: number;

  @Field(() => Int)
  completed: number;

  @Field(() => Int)
  rejected: number;

  @Field(() => Int)
  total: number;
}

@ObjectType()
export class DocumentStatisticsResponse {
  @Field(() => Metadata)
  metadata: Metadata;

  @Field(() => DocumentStatistics)
  data: DocumentStatistics;
}

@ObjectType()
export class DocumentHistoryItem {
  @Field(() => Int)
  id: number;

  @Field(() => String)
  actionType: string;

  @Field(() => User, { nullable: true })
  actionByUser: User;

  @Field(() => Date)
  actionAt: Date;

  @Field(() => String, { nullable: true })
  note: string;

  @Field(() => String)
  stepName: string;

  @Field(() => String)
  stepType: string;
}

@ObjectType()
export class DocumentHistoryResponse {
  @Field(() => Metadata)
  metadata: Metadata;

  @Field(() => [DocumentHistoryItem])
  data: DocumentHistoryItem[];
}

// Helper function để tạo metadata
function createMetadata(statusCode: number, message: string): Metadata {
  return {
    statusCode,
    message,
    timestamp: new Date().toISOString(),
  };
}

@Resolver(() => Document)
@UseGuards(GqlAuthGuard, RolesGuard)
export class DocumentsResolver {
  constructor(
    private readonly documentsService: DocumentsService,
    private readonly documentProcessingService: DocumentProcessingService,
    private readonly workflowInstancesService: WorkflowInstancesService,
  ) {}

  @Mutation(() => DocumentResponse)
  @Roles(Role.SYSTEM_ADMIN, Role.DEPARTMENT_STAFF, Role.CLERK)
  async createDocument(
    @Args('createDocumentInput') createDocumentInput: CreateDocumentInput,
    @Args({
      name: 'file',
      type: () => GraphQLUpload,
      nullable: true,
    })
    file?: FileUpload,
    @CurrentUser() user?: User,
  ): Promise<DocumentResponse> {
    try {
      const document = await this.documentsService.create(createDocumentInput, file, user);
      return {
        metadata: createMetadata(201, 'Document created successfully'),
        data: document,
      };
    } catch (error) {
      return {
        metadata: createMetadata(400, error.message),
        data: null,
      };
    }
  }

  @Query(() => GetDocumentsPaginatedResponse)
  async documents(@Args('input') input: GetDocumentsPaginatedInput): Promise<GetDocumentsPaginatedResponse> {
    try {
      const result = await this.documentsService.findPaginated(input);
      return {
        metadata: createMetadata(200, 'Documents retrieved successfully'),
        data: result.data,
        totalCount: result.meta.itemCount,
        hasNextPage: result.meta.hasNextPage,
      };
    } catch (error) {
      return {
        metadata: createMetadata(400, error.message),
        data: [],
        totalCount: 0,
        hasNextPage: false,
      };
    }
  }

  @Query(() => DocumentResponse)
  async document(@Args('id', { type: () => Int }) id: number): Promise<DocumentResponse> {
    try {
      const document = await this.documentsService.findOne(id);
      return {
        metadata: createMetadata(200, 'Document retrieved successfully'),
        data: document,
      };
    } catch (error) {
      return {
        metadata: createMetadata(404, error.message),
        data: null,
      };
    }
  }

  @Mutation(() => DocumentResponse)
  @Roles(Role.SYSTEM_ADMIN, Role.DEPARTMENT_STAFF, Role.CLERK)
  async updateDocument(
    @Args('updateDocumentInput') updateDocumentInput: UpdateDocumentInput,
    @CurrentUser() user?: User,
  ): Promise<DocumentResponse> {
    try {
      const document = await this.documentsService.update(updateDocumentInput.id, updateDocumentInput);
      return {
        metadata: createMetadata(200, 'Document updated successfully'),
        data: document,
      };
    } catch (error) {
      return {
        metadata: createMetadata(400, error.message),
        data: null,
      };
    }
  }

  @Mutation(() => DocumentResponse)
  @Roles(Role.SYSTEM_ADMIN, Role.DEPARTMENT_STAFF)
  async removeDocument(@Args('id', { type: () => Int }) id: number): Promise<DocumentResponse> {
    try {
      const success = await this.documentsService.remove(id);
      return {
        metadata: createMetadata(200, success ? 'Document removed successfully' : 'Document not found'),
        data: null,
      };
    } catch (error) {
      return {
        metadata: createMetadata(400, error.message),
        data: null,
      };
    }
  }

  // === NEW BUSINESS LOGIC QUERIES ===

  @Query(() => DocumentsForProcessingResponse)
  async myDocumentsForProcessing(@CurrentUser() user: User): Promise<DocumentsForProcessingResponse> {
    try {
      const documents = await this.documentProcessingService.getDocumentsForProcessing(user);
      // Convert Document entities to DocumentProcessingInfo
      const processingInfo: DocumentProcessingInfo[] = documents.map(doc => ({
        documentId: doc.id,
        documentTitle: doc.title,
        documentType: doc.documentType,
        documentCategory: doc.documentCategory?.name || 'Unknown',
        status: doc.status || 'DRAFT',
        createdAt: doc.createdAt,
        workflowInstanceId: undefined, // TODO: Get from workflow service
        currentStepId: undefined, // TODO: Get from workflow service
        currentStepName: undefined, // TODO: Get from workflow service
        workflowStatus: undefined, // TODO: Get from workflow service
        requiresAction: true, // TODO: Determine based on workflow
        actionType: undefined, // TODO: Get from workflow service
        deadline: doc.deadline,
        priority: (doc.priority || 'MEDIUM') as unknown as PriorityEnum,
      }));
      
      return {
        documents: processingInfo,
      };
    } catch (error) {
      return {
        documents: [],
      };
    }
  }

  // Alias for frontend compatibility
  @Query(() => DocumentsForProcessingResponse)
  async documentsForProcessing(@CurrentUser() user: User): Promise<DocumentsForProcessingResponse> {
    try {
      const documents = await this.documentProcessingService.getDocumentsForProcessing(user);
      
      // Get workflow information for each document
      const processingInfo: DocumentProcessingInfo[] = await Promise.all(
        documents.map(async (doc) => {
          // Get workflow instance for this document
          const workflowInstances = await this.workflowInstancesService.findByDocumentId(doc.id);
          const workflowInstance = workflowInstances[0]; // Take the first one
          
          return {
            documentId: doc.id,
            documentTitle: doc.title,
            documentType: doc.documentType,
            documentCategory: doc.documentCategory?.name || 'Unknown',
            status: doc.status || 'DRAFT',
            createdAt: doc.createdAt,
            workflowInstanceId: workflowInstance?.id,
            currentStepId: workflowInstance?.currentStepId,
            currentStepName: workflowInstance?.currentStep?.name || 'Unknown Step',
            workflowStatus: workflowInstance?.status,
            requiresAction: true, // Documents returned by getDocumentsForProcessing always require action
            actionType: 'APPROVE', // Default action type
            deadline: doc.deadline,
            priority: (doc.priority || 'MEDIUM') as unknown as PriorityEnum,
          };
        })
      );
      
      return {
        documents: processingInfo,
      };
    } catch (error) {
      console.error('Error in documentsForProcessing:', error);
      return {
        documents: [],
      };
    }
  }

  @Query(() => DocumentsResponse)
  async myDocumentsByStatus(
    @Args('status') status: 'pending' | 'processing' | 'completed' | 'rejected',
    @CurrentUser() user: User,
  ): Promise<DocumentsResponse> {
    try {
      const documents = await this.documentProcessingService.getDocumentsByStatus(user, status);
      return {
        metadata: createMetadata(200, `Documents with status ${status} retrieved successfully`),
        data: documents,
      };
    } catch (error) {
      return {
        metadata: createMetadata(400, error.message),
        data: [],
      };
    }
  }

  @Query(() => DocumentStatisticsResponse)
  async myDocumentStatistics(@CurrentUser() user: User): Promise<DocumentStatisticsResponse> {
    try {
      const statistics = await this.documentProcessingService.getDocumentStatistics(user);
      return {
        metadata: createMetadata(200, 'Document statistics retrieved successfully'),
        data: statistics,
      };
    } catch (error) {
      return {
        metadata: createMetadata(400, error.message),
        data: {
          pending: 0,
          processing: 0,
          completed: 0,
          rejected: 0,
          total: 0,
        },
      };
    }
  }

  // Alias for frontend compatibility
  @Query(() => ProcessingStatisticsResponse)
  async processingStatistics(@CurrentUser() user: User): Promise<ProcessingStatisticsResponse> {
    try {
      const statistics = await this.documentProcessingService.getDocumentStatistics(user);
      const processingStats: ProcessingStatistics = {
        totalDocuments: statistics.total,
        pendingCount: statistics.pending,
        completedCount: statistics.completed,
        inProgressCount: statistics.processing,
        completionRate: statistics.total > 0 ? Math.round((statistics.completed / statistics.total) * 100) : 0,
      };
      
      return {
        metadata: createMetadata(200, 'Processing statistics retrieved successfully'),
        data: processingStats,
      };
    } catch (error) {
      return {
        metadata: createMetadata(400, error.message),
        data: {
          totalDocuments: 0,
          pendingCount: 0,
          completedCount: 0,
          inProgressCount: 0,
          completionRate: 0,
        },
      };
    }
  }

  @Query(() => DocumentProcessingHistoryResponse)
  async documentProcessingHistory(@Args('documentId', { type: () => Int }) documentId: number): Promise<DocumentProcessingHistoryResponse> {
    try {
      const history = await this.documentProcessingService.getDocumentProcessingHistory(documentId);
      return {
        data: history,
        totalCount: history.length,
      };
    } catch (error) {
      return {
        data: [],
        totalCount: 0,
      };
    }
  }

  @Query(() => DocumentsResponse)
  async searchDocuments(
    @CurrentUser() user: User,
    @Args('searchTerm', { nullable: true }) searchTerm?: string,
    @Args('status', { nullable: true }) status?: DocumentStatus,
    @Args('documentType', { nullable: true }) documentType?: DocumentTypeEnum,
    @Args('priority', { nullable: true }) priority?: DocumentPriority,
  ): Promise<DocumentsResponse> {
    try {
      const documents = await this.documentProcessingService.searchDocuments(
        user,
        searchTerm,
        status,
        documentType,
        priority
      );
      return {
        metadata: createMetadata(200, 'Documents search completed successfully'),
        data: documents,
      };
    } catch (error) {
      return {
        metadata: createMetadata(400, error.message),
        data: [],
      };
    }
  }

  // Get processed documents
  @Query(() => ProcessedDocumentsResponse)
  async processedDocuments(@CurrentUser() user: User): Promise<ProcessedDocumentsResponse> {
    try {
      const documents = await this.documentProcessingService.getProcessedDocuments(user);
      // Convert Document entities to DocumentProcessingInfo
      const processingInfo: DocumentProcessingInfo[] = documents.map(doc => ({
        documentId: doc.id,
        documentTitle: doc.title,
        documentType: doc.documentType,
        documentCategory: doc.documentCategory?.name || 'Unknown',
        status: doc.status || 'DRAFT',
        createdAt: doc.createdAt,
        workflowInstanceId: undefined, // TODO: Get from workflow service
        currentStepId: undefined, // TODO: Get from workflow service
        currentStepName: undefined, // TODO: Get from workflow service
        workflowStatus: undefined, // TODO: Get from workflow service
        requiresAction: false, // Processed documents don't require action
        actionType: undefined,
        deadline: doc.deadline,
        priority: (doc.priority || 'MEDIUM') as unknown as PriorityEnum,
      }));
      
      return {
        documents: processingInfo,
      };
    } catch (error) {
      return {
        documents: [],
      };
    }
  }

  // Get urgent documents
  @Query(() => DocumentsForProcessingResponse)
  async urgentDocuments(@CurrentUser() user: User): Promise<DocumentsForProcessingResponse> {
    try {
      const documents = await this.documentProcessingService.getUrgentDocuments(user);
      // Convert Document entities to DocumentProcessingInfo
      const processingInfo: DocumentProcessingInfo[] = documents.map(doc => ({
        documentId: doc.id,
        documentTitle: doc.title,
        documentType: doc.documentType,
        documentCategory: doc.documentCategory?.name || 'Unknown',
        status: doc.status || 'DRAFT',
        createdAt: doc.createdAt,
        workflowInstanceId: undefined, // TODO: Get from workflow service
        currentStepId: undefined, // TODO: Get from workflow service
        currentStepName: undefined, // TODO: Get from workflow service
        workflowStatus: undefined, // TODO: Get from workflow service
        requiresAction: true, // Urgent documents require action
        actionType: undefined, // TODO: Get from workflow service
        deadline: doc.deadline,
        priority: (doc.priority || 'HIGH') as unknown as PriorityEnum,
      }));
      
      return {
        documents: processingInfo,
      };
    } catch (error) {
      return {
        documents: [],
      };
    }
  }

  // === NEW BUSINESS LOGIC MUTATIONS ===

  @Mutation(() => DocumentResponse)
  @Roles(Role.SYSTEM_ADMIN, Role.UNIVERSITY_LEADER, Role.DEPARTMENT_STAFF)
  async assignDocumentToUser(
    @Args('documentId', { type: () => Int }) documentId: number,
    @Args('assignedToUserId', { type: () => Int }) assignedToUserId: number,
    @CurrentUser() user: User,
  ): Promise<DocumentResponse> {
    try {
      const document = await this.documentProcessingService.assignDocumentToUser(documentId, assignedToUserId, user);
      return {
        metadata: createMetadata(200, 'Document assigned successfully'),
        data: document,
      };
    } catch (error) {
      return {
        metadata: createMetadata(400, error.message),
        data: null,
      };
    }
  }

  @Mutation(() => DocumentResponse)
  @Roles(Role.SYSTEM_ADMIN)
  async updateDocumentStatusFromWorkflow(
    @Args('documentId', { type: () => Int }) documentId: number,
    @Args('workflowStatus') workflowStatus: string,
  ): Promise<DocumentResponse> {
    try {
      await this.documentsService.updateDocumentStatusFromWorkflow(documentId, workflowStatus);
      return {
        metadata: createMetadata(200, 'Document status updated successfully'),
        data: null,
      };
    } catch (error) {
      return {
        metadata: createMetadata(400, error.message),
        data: null,
      };
    }
  }

  @Mutation(() => DocumentResponse)
  @Roles(Role.SYSTEM_ADMIN, Role.UNIVERSITY_LEADER, Role.DEPARTMENT_HEAD, Role.DEPARTMENT_STAFF)
  async processDocumentAction(
    @Args('input') input: DocumentActionInput,
    @CurrentUser() user: User,
  ): Promise<DocumentResponse> {
    try {
      const document = await this.documentProcessingService.processDocumentAction(input, user);
      return {
        metadata: createMetadata(200, 'Document action processed successfully'),
        data: document,
      };
    } catch (error) {
      return {
        metadata: createMetadata(400, error.message),
        data: null,
      };
    }
  }
}
