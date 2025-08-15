import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkflowStepsService } from './workflow-steps.service';
import { WorkflowStepsResolver } from './workflow-steps.resolver';
import { WorkflowStep } from './entities/workflow-step.entity';

@Module({
  imports: [TypeOrmModule.forFeature([WorkflowStep])],
  providers: [WorkflowStepsResolver, WorkflowStepsService],
  exports: [WorkflowStepsService]
})
export class WorkflowStepsModule {}
