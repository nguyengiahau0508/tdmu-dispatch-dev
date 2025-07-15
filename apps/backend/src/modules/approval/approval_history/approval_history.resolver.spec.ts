import { Test, TestingModule } from '@nestjs/testing';
import { ApprovalHistoryResolver } from './approval_history.resolver';
import { ApprovalHistoryService } from './approval_history.service';

describe('ApprovalHistoryResolver', () => {
  let resolver: ApprovalHistoryResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ApprovalHistoryResolver, ApprovalHistoryService],
    }).compile();

    resolver = module.get<ApprovalHistoryResolver>(ApprovalHistoryResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
