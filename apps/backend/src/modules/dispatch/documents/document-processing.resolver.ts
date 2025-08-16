import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from 'src/auth/guards/gql-auth.guard';
import { CurrentUser } from 'src/common/decorators/user.decorator';
import { User } from 'src/modules/users/entities/user.entity';
import { DocumentProcessingService } from './document-processing.service';
import { createResponseMetadata } from 'src/common/helpers/metadata.helper';
import { HttpStatus } from '@nestjs/common';
import { DocumentsForProcessingResponse } from './dto/document-processing/document-processing-info.output';
import { ProcessedDocumentsResponse } from './dto/document-processing/document-processing-info.output';
import { ProcessingStatisticsResponse } from './dto/document-processing/processing-statistics.output';
import { ProcessDocumentOutput } from './dto/document-processing/process-document.output';
import { DocumentActionInput } from './dto/document-processing/document-action.input';

@Resolver()
@UseGuards(GqlAuthGuard)
export class DocumentProcessingResolver {
  constructor(private readonly documentProcessingService: DocumentProcessingService) {}

  @Query(() => DocumentsForProcessingResponse, { description: 'Lấy danh sách documents cần xử lý' })
  async documentsForProcessing(@CurrentUser() user: User): Promise<DocumentsForProcessingResponse> {
    console.log('=== DOCUMENTS FOR PROCESSING RESOLVER ===');
    console.log('User:', user.id, user.email);

    const documents = await this.documentProcessingService.getDocumentsForProcessing(user);
    
    return {
      documents,
    };
  }

  @Query(() => ProcessedDocumentsResponse, { description: 'Lấy danh sách documents đã xử lý' })
  async processedDocuments(@CurrentUser() user: User): Promise<ProcessedDocumentsResponse> {
    console.log('=== PROCESSED DOCUMENTS RESOLVER ===');
    console.log('User:', user.id, user.email);

    const documents = await this.documentProcessingService.getProcessedDocuments(user);
    
    return {
      documents,
    };
  }

  @Query(() => ProcessingStatisticsResponse, { description: 'Lấy thống kê xử lý document' })
  async processingStatistics(@CurrentUser() user: User): Promise<ProcessingStatisticsResponse> {
    console.log('=== PROCESSING STATISTICS RESOLVER ===');
    console.log('User:', user.id, user.email);

    const statistics = await this.documentProcessingService.getProcessingStatistics(user);
    
    return {
      metadata: createResponseMetadata(
        HttpStatus.OK,
        'Lấy thống kê xử lý thành công',
      ),
      data: statistics,
    };
  }

  @Mutation(() => ProcessDocumentOutput, { description: 'Xử lý document action' })
  async processDocumentAction(
    @Args('input') input: DocumentActionInput,
    @CurrentUser() user: User,
  ): Promise<ProcessDocumentOutput> {
    console.log('=== PROCESS DOCUMENT ACTION RESOLVER ===');
    console.log('User:', user.id, user.email);
    console.log('Input:', input);

    const result = await this.documentProcessingService.processDocumentAction(input, user);
    
    return {
      metadata: createResponseMetadata(
        HttpStatus.OK,
        'Xử lý document thành công',
      ),
      data: {
        documentId: result.documentId,
        workflowInstanceId: result.workflowInstanceId,
        actionType: result.actionType,
        message: result.message,
        workflowStatus: result.result.status,
      },
    };
  }

  @Query(() => DocumentsForProcessingResponse, { description: 'Lấy documents theo priority' })
  async documentsByPriority(
    @Args('priority') priority: string,
    @CurrentUser() user: User,
  ): Promise<DocumentsForProcessingResponse> {
    console.log('=== DOCUMENTS BY PRIORITY RESOLVER ===');
    console.log('User:', user.id, user.email);
    console.log('Priority:', priority);

    const documents = await this.documentProcessingService.getDocumentsByPriority(user, priority);
    
    return {
      documents,
    };
  }

  @Query(() => DocumentsForProcessingResponse, { description: 'Lấy documents sắp hết hạn' })
  async urgentDocuments(@CurrentUser() user: User): Promise<DocumentsForProcessingResponse> {
    console.log('=== URGENT DOCUMENTS RESOLVER ===');
    console.log('User:', user.id, user.email);

    const documents = await this.documentProcessingService.getUrgentDocuments(user);
    
    return {
      documents,
    };
  }
}
