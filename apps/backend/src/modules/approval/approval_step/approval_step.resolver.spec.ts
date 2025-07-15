import { Test, TestingModule } from '@nestjs/testing';
import { ApprovalStepResolver } from './approval_step.resolver';
import { ApprovalStepService } from './approval_step.service';

describe('ApprovalStepResolver', () => {
  let resolver: ApprovalStepResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ApprovalStepResolver, ApprovalStepService],
    }).compile();

    resolver = module.get<ApprovalStepResolver>(ApprovalStepResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
