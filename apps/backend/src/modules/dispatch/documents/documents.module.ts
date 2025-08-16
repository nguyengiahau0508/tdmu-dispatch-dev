import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentsService } from './documents.service';
import { DocumentsResolver } from './documents.resolver';
import { DocumentWorkflowService } from './document-workflow.service';
import { DocumentWorkflowResolver } from './document-workflow.resolver';
import { DocumentProcessingService } from './document-processing.service';
import { DocumentProcessingResolver } from './document-processing.resolver';
import { Document } from './entities/document.entity';
import { GoogleDriveModule } from 'src/integrations/google-drive/google-drive.module';
import { DocumentCategoryModule } from '../document-category/document-category.module';
import { WorkflowInstancesModule } from 'src/modules/workflow/workflow-instances/workflow-instances.module';
import { WorkflowTemplatesModule } from 'src/modules/workflow/workflow-templates/workflow-templates.module';
import { WorkflowActionLogsModule } from 'src/modules/workflow/workflow-action-logs/workflow-action-logs.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Document]),
    GoogleDriveModule,
    DocumentCategoryModule,
    WorkflowInstancesModule,
    WorkflowTemplatesModule,
    WorkflowActionLogsModule,
  ],
  providers: [
    DocumentsResolver, 
    DocumentsService,
    DocumentWorkflowResolver,
    DocumentWorkflowService,
    DocumentProcessingResolver,
    DocumentProcessingService,
  ],
  exports: [DocumentsService, DocumentWorkflowService, DocumentProcessingService],
})
export class DocumentsModule {}
