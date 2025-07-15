import { Module } from '@nestjs/common';
import { ApprovalHistoryService } from './approval_history.service';
import { ApprovalHistoryResolver } from './approval_history.resolver';

@Module({
  providers: [ApprovalHistoryResolver, ApprovalHistoryService],
})
export class ApprovalHistoryModule {}
