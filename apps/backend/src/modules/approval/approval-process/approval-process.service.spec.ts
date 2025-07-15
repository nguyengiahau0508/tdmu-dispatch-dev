import { Test, TestingModule } from '@nestjs/testing';
import { ApprovalProcessService } from './approval-process.service';

describe('ApprovalProcessService', () => {
  let service: ApprovalProcessService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ApprovalProcessService],
    }).compile();

    service = module.get<ApprovalProcessService>(ApprovalProcessService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
