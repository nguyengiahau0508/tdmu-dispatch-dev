import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkflowInstancesService } from './workflow-instances.service';
import { WorkflowInstancesResolver } from './workflow-instances.resolver';
import { WorkflowInstance } from './entities/workflow-instance.entity';
import { WorkflowStepsModule } from '../workflow-steps/workflow-steps.module';
import { WorkflowActionLogsModule } from '../workflow-action-logs/workflow-action-logs.module';
import { WorkflowTemplatesModule } from '../workflow-templates/workflow-templates.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([WorkflowInstance]),
    WorkflowStepsModule,
    WorkflowActionLogsModule,
    WorkflowTemplatesModule,
  ],
  providers: [WorkflowInstancesResolver, WorkflowInstancesService],
  exports: [WorkflowInstancesService],
})
export class WorkflowInstancesModule {}
