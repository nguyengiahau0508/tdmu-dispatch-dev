import { Module } from '@nestjs/common';
import { WorkflowInstancesService } from './workflow-instances.service';
import { WorkflowInstancesResolver } from './workflow-instances.resolver';
import { WorkflowInstance } from './entities/workflow-instance.entity';

@Module({
  imports: [WorkflowInstance],
  providers: [WorkflowInstancesResolver, WorkflowInstancesService],
})
export class WorkflowInstancesModule {}
