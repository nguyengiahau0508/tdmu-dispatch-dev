import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkflowActionLogsService } from './workflow-action-logs.service';
import { WorkflowActionLogsResolver } from './workflow-action-logs.resolver';
import { WorkflowActionLog } from './entities/workflow-action-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([WorkflowActionLog])],
  providers: [WorkflowActionLogsResolver, WorkflowActionLogsService],
  exports: [WorkflowActionLogsService]
})
export class WorkflowActionLogsModule {}
