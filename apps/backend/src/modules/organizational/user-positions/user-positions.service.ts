import { Injectable } from '@nestjs/common';
import { CreateUserPositionInput } from './dto/create-user-position.input';
import { UpdateUserPositionInput } from './dto/update-user-position.input';

@Injectable()
export class UserPositionsService {
  create(createUserPositionInput: CreateUserPositionInput) {
    return 'This action adds a new userPosition';
  }

  findAll() {
    return `This action returns all userPositions`;
  }

  findOne(id: number) {
    return `This action returns a #${id} userPosition`;
  }

  update(id: number, updateUserPositionInput: UpdateUserPositionInput) {
    return `This action updates a #${id} userPosition`;
  }

  remove(id: number) {
    return `This action removes a #${id} userPosition`;
  }
}
