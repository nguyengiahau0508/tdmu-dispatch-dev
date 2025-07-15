import { Module } from "@nestjs/common";
import { ApprovalHistoryModule } from "./approval_history/approval_history.module";
import { ApprovalProcessModule } from "./approval-process/approval-process.module";
import { ApprovalStepModule } from "./approval_step/approval_step.module";


@Module({
    imports: [ApprovalHistoryModule, ApprovalProcessModule, ApprovalStepModule]
})
export class ApprovalModule{}