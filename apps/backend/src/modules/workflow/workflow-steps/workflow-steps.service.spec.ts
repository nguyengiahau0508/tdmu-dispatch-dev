import { Test, TestingModule } from '@nestjs/testing';
import { WorkflowStepsService } from './workflow-steps.service';

describe('WorkflowStepsService', () => {
  let service: WorkflowStepsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WorkflowStepsService],
    }).compile();

    service = module.get<WorkflowStepsService>(WorkflowStepsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
