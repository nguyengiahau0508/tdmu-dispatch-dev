import { Test, TestingModule } from '@nestjs/testing';
import { ApprovalStepService } from './approval_step.service';

describe('ApprovalStepService', () => {
  let service: ApprovalStepService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ApprovalStepService],
    }).compile();

    service = module.get<ApprovalStepService>(ApprovalStepService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
