import { Module } from '@nestjs/common';
import { WorkflowActionLogsService } from './workflow-action-logs.service';
import { WorkflowActionLogsResolver } from './workflow-action-logs.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkflowActionLog } from './entities/workflow-action-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([WorkflowActionLog])],
  providers: [WorkflowActionLogsResolver, WorkflowActionLogsService],
})
export class WorkflowActionLogsModule {}
