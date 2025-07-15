import { Module } from '@nestjs/common';
import { ApprovalProcessService } from './approval-process.service';
import { ApprovalProcessResolver } from './approval-process.resolver';

@Module({
  providers: [ApprovalProcessResolver, ApprovalProcessService],
})
export class ApprovalProcessModule {}
