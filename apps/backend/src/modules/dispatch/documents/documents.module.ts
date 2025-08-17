import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentsService } from './documents.service';
import { DocumentProcessingService } from './document-processing.service';
import { DocumentsResolver } from './documents.resolver';
import { TaskAssignmentService } from './task-assignment.service';
import { TaskAssignmentResolver } from './task-assignment.resolver';
import { TaskRequestService } from './task-request.service';
import { TaskRequestResolver } from './task-request.resolver';
import { Document } from './entities/document.entity';
import { TaskAssignment } from './entities/task-assignment.entity';
import { TaskRequest } from './entities/task-request.entity';
import { DocumentCategory } from '../document-category/entities/document-category.entity';
import { File } from 'src/modules/files/entities/file.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { GoogleDriveService } from 'src/integrations/google-drive/google-drive.service';
import { WorkflowInstancesService } from 'src/modules/workflow/workflow-instances/workflow-instances.service';
import { WorkflowActionLogsService } from 'src/modules/workflow/workflow-action-logs/workflow-action-logs.service';
import { WorkflowStepsService } from 'src/modules/workflow/workflow-steps/workflow-steps.service';
import { WorkflowTemplatesService } from 'src/modules/workflow/workflow-templates/workflow-templates.service';
import { WorkflowPermissionsService } from 'src/modules/workflow/workflow-permissions/workflow-permissions.service';
import { WorkflowModule } from 'src/modules/workflow/workflow.module';
import { DocumentCategoryModule } from '../document-category/document-category.module';
import { FilesModule } from 'src/modules/files/files.module';
import { GoogleDriveModule } from 'src/integrations/google-drive/google-drive.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Document, TaskAssignment, TaskRequest, DocumentCategory, File, User]),
    forwardRef(() => WorkflowModule),
    DocumentCategoryModule,
    FilesModule,
    GoogleDriveModule,
  ],
  providers: [
    DocumentsService,
    DocumentProcessingService,
    TaskAssignmentService,
    TaskRequestService,
    DocumentsResolver,
    TaskAssignmentResolver,
    TaskRequestResolver,
  ],
  exports: [DocumentsService, DocumentProcessingService, TaskAssignmentService, TaskRequestService],
})
export class DocumentsModule {}
