import { Test, TestingModule } from '@nestjs/testing';
import { WorkflowTemplatesResolver } from './workflow-templates.resolver';
import { WorkflowTemplatesService } from './workflow-templates.service';

describe('WorkflowTemplatesResolver', () => {
  let resolver: WorkflowTemplatesResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WorkflowTemplatesResolver, WorkflowTemplatesService],
    }).compile();

    resolver = module.get<WorkflowTemplatesResolver>(WorkflowTemplatesResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
