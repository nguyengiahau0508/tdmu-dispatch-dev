
import { WorkflowTemplatesModule } from './workflow-templates/workflow-templates.module';
import { WorkflowStepsModule } from './workflow-steps/workflow-steps.module';
import { WorkflowInstancesModule } from './workflow-instances/workflow-instances.module';
import { WorkflowActionLogsModule } from './workflow-action-logs/workflow-action-logs.module';
import { Module } from '@nestjs/common';

@Module({
    imports: [WorkflowActionLogsModule, WorkflowInstancesModule, WorkflowStepsModule, WorkflowTemplatesModule]
})
export class WorkflowModule { }