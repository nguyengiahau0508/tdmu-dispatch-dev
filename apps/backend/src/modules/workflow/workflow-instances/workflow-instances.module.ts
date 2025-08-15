import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkflowInstancesService } from './workflow-instances.service';
import { WorkflowInstancesResolver } from './workflow-instances.resolver';
import { WorkflowInstance } from './entities/workflow-instance.entity';
import { WorkflowTemplatesModule } from '../workflow-templates/workflow-templates.module';
import { WorkflowStepsModule } from '../workflow-steps/workflow-steps.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([WorkflowInstance]),
    WorkflowTemplatesModule,
    WorkflowStepsModule
  ],
  providers: [WorkflowInstancesResolver, WorkflowInstancesService],
  exports: [WorkflowInstancesService]
})
export class WorkflowInstancesModule {}
