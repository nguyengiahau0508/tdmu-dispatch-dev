import { Injectable } from '@nestjs/common';
import { CreateApprovalProcessInput } from './dto/create-approval-process.input';
import { UpdateApprovalProcessInput } from './dto/update-approval-process.input';

@Injectable()
export class ApprovalProcessService {
  create(createApprovalProcessInput: CreateApprovalProcessInput) {
    return 'This action adds a new approvalProcess';
  }

  findAll() {
    return `This action returns all approvalProcess`;
  }

  findOne(id: number) {
    return `This action returns a #${id} approvalProcess`;
  }

  update(id: number, updateApprovalProcessInput: UpdateApprovalProcessInput) {
    return `This action updates a #${id} approvalProcess`;
  }

  remove(id: number) {
    return `This action removes a #${id} approvalProcess`;
  }
}
