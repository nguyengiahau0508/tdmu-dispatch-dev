import { Test, TestingModule } from '@nestjs/testing';
import { WorkflowStepsResolver } from './workflow-steps.resolver';
import { WorkflowStepsService } from './workflow-steps.service';

describe('WorkflowStepsResolver', () => {
  let resolver: WorkflowStepsResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WorkflowStepsResolver, WorkflowStepsService],
    }).compile();

    resolver = module.get<WorkflowStepsResolver>(WorkflowStepsResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
