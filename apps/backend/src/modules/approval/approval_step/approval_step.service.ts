import { Injectable } from '@nestjs/common';
import { CreateApprovalStepInput } from './dto/create-approval_step.input';
import { UpdateApprovalStepInput } from './dto/update-approval_step.input';

@Injectable()
export class ApprovalStepService {
  create(createApprovalStepInput: CreateApprovalStepInput) {
    return 'This action adds a new approvalStep';
  }

  findAll() {
    return `This action returns all approvalStep`;
  }

  findOne(id: number) {
    return `This action returns a #${id} approvalStep`;
  }

  update(id: number, updateApprovalStepInput: UpdateApprovalStepInput) {
    return `This action updates a #${id} approvalStep`;
  }

  remove(id: number) {
    return `This action removes a #${id} approvalStep`;
  }
}
