import { Test, TestingModule } from '@nestjs/testing';
import { ApprovalProcessResolver } from './approval-process.resolver';
import { ApprovalProcessService } from './approval-process.service';

describe('ApprovalProcessResolver', () => {
  let resolver: ApprovalProcessResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ApprovalProcessResolver, ApprovalProcessService],
    }).compile();

    resolver = module.get<ApprovalProcessResolver>(ApprovalProcessResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
