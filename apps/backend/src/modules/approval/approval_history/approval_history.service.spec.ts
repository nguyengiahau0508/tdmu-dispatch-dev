import { Test, TestingModule } from '@nestjs/testing';
import { ApprovalHistoryService } from './approval_history.service';

describe('ApprovalHistoryService', () => {
  let service: ApprovalHistoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ApprovalHistoryService],
    }).compile();

    service = module.get<ApprovalHistoryService>(ApprovalHistoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
