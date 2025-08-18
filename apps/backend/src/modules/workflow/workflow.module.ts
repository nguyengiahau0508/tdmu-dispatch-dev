import { WorkflowTemplatesModule } from './workflow-templates/workflow-templates.module';
import { WorkflowStepsModule } from './workflow-steps/workflow-steps.module';
import { WorkflowInstancesModule } from './workflow-instances/workflow-instances.module';
import { WorkflowActionLogsModule } from './workflow-action-logs/workflow-action-logs.module';
import { WorkflowPermissionsModule } from './workflow-permissions/workflow-permissions.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Document } from '../dispatch/documents/entities/document.entity';
import { WorkflowTemplate } from './workflow-templates/entities/workflow-template.entity';
import { WorkflowStep } from './workflow-steps/entities/workflow-step.entity';
import { WorkflowInstance } from './workflow-instances/entities/workflow-instance.entity';
import { WorkflowActionLog } from './workflow-action-logs/entities/workflow-action-log.entity';
import { WorkflowDetailService } from './services/workflow-detail.service';
import { WorkflowDetailResolver } from './workflow-detail.resolver';

@Module({
  imports: [
    WorkflowActionLogsModule,
    WorkflowInstancesModule,
    WorkflowStepsModule,
    WorkflowTemplatesModule,
    WorkflowPermissionsModule,
    TypeOrmModule.forFeature([
      Document,
      WorkflowTemplate,
      WorkflowStep,
      WorkflowInstance,
      WorkflowActionLog,
    ]),
  ],
  providers: [WorkflowDetailService, WorkflowDetailResolver],
  exports: [
    WorkflowInstancesModule,
    WorkflowActionLogsModule,
    WorkflowStepsModule,
    WorkflowTemplatesModule,
    WorkflowPermissionsModule,
    WorkflowDetailService,
  ],
})
export class WorkflowModule {}
