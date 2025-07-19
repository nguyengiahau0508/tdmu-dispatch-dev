import { Test, TestingModule } from '@nestjs/testing';
import { WorkflowInstancesResolver } from './workflow-instances.resolver';
import { WorkflowInstancesService } from './workflow-instances.service';

describe('WorkflowInstancesResolver', () => {
  let resolver: WorkflowInstancesResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WorkflowInstancesResolver, WorkflowInstancesService],
    }).compile();

    resolver = module.get<WorkflowInstancesResolver>(WorkflowInstancesResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
