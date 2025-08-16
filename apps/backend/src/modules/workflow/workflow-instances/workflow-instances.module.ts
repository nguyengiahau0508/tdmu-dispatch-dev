import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkflowInstancesService } from './workflow-instances.service';
import { WorkflowInstancesResolver } from './workflow-instances.resolver';
import { WorkflowInstance } from './entities/workflow-instance.entity';
import { WorkflowStepsModule } from '../workflow-steps/workflow-steps.module';
import { WorkflowActionLogsModule } from '../workflow-action-logs/workflow-action-logs.module';
import { WorkflowTemplatesModule } from '../workflow-templates/workflow-templates.module';
import { WorkflowPermissionsModule } from '../workflow-permissions/workflow-permissions.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([WorkflowInstance]),
    WorkflowStepsModule,
    WorkflowActionLogsModule,
    WorkflowTemplatesModule,
    forwardRef(() => WorkflowPermissionsModule),
  ],
  providers: [WorkflowInstancesResolver, WorkflowInstancesService],
  exports: [WorkflowInstancesService],
})
export class WorkflowInstancesModule {}
