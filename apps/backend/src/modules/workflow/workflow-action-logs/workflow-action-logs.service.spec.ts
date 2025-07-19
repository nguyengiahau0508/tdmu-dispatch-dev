import { Test, TestingModule } from '@nestjs/testing';
import { WorkflowActionLogsService } from './workflow-action-logs.service';

describe('WorkflowActionLogsService', () => {
  let service: WorkflowActionLogsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WorkflowActionLogsService],
    }).compile();

    service = module.get<WorkflowActionLogsService>(WorkflowActionLogsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
