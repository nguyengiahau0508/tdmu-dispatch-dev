import { Test, TestingModule } from '@nestjs/testing';
import { WorkflowActionLogsResolver } from './workflow-action-logs.resolver';
import { WorkflowActionLogsService } from './workflow-action-logs.service';

describe('WorkflowActionLogsResolver', () => {
  let resolver: WorkflowActionLogsResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WorkflowActionLogsResolver, WorkflowActionLogsService],
    }).compile();

    resolver = module.get<WorkflowActionLogsResolver>(
      WorkflowActionLogsResolver,
    );
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
