import { Module } from '@nestjs/common';
import { ApprovalStepService } from './approval_step.service';
import { ApprovalStepResolver } from './approval_step.resolver';

@Module({
  providers: [ApprovalStepResolver, ApprovalStepService],
})
export class ApprovalStepModule {}
