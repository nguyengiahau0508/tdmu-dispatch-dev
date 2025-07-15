import { Injectable } from '@nestjs/common';
import { CreateApprovalHistoryInput } from './dto/create-approval_history.input';
import { UpdateApprovalHistoryInput } from './dto/update-approval_history.input';

@Injectable()
export class ApprovalHistoryService {
  create(createApprovalHistoryInput: CreateApprovalHistoryInput) {
    return 'This action adds a new approvalHistory';
  }

  findAll() {
    return `This action returns all approvalHistory`;
  }

  findOne(id: number) {
    return `This action returns a #${id} approvalHistory`;
  }

  update(id: number, updateApprovalHistoryInput: UpdateApprovalHistoryInput) {
    return `This action updates a #${id} approvalHistory`;
  }

  remove(id: number) {
    return `This action removes a #${id} approvalHistory`;
  }
}
