import { Module } from '@nestjs/common';
import { WorkflowInstancesService } from './workflow-instances.service';
import { WorkflowInstancesResolver } from './workflow-instances.resolver';
import { WorkflowInstance } from './entities/workflow-instance.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([WorkflowInstance])],
  providers: [WorkflowInstancesResolver, WorkflowInstancesService],
})
export class WorkflowInstancesModule { }
