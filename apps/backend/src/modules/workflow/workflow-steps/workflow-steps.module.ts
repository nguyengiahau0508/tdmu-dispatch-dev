import { Module } from '@nestjs/common';
import { WorkflowStepsService } from './workflow-steps.service';
import { WorkflowStepsResolver } from './workflow-steps.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkflowStep } from './entities/workflow-step.entity';

@Module({
  imports: [TypeOrmModule.forFeature([WorkflowStep])],
  providers: [WorkflowStepsResolver, WorkflowStepsService],
})
export class WorkflowStepsModule { }
