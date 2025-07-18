import { Injectable } from '@nestjs/common';
import { CreateUserPositionInput } from './dto/create-user-position/create-user-position.input';
import { InjectRepository } from '@nestjs/typeorm';
import { UserPosition } from './entities/user-position.entity';
import { Repository } from 'typeorm';


@Injectable()
export class UserPositionsService {
  constructor(
    @InjectRepository(UserPosition) private readonly repository: Repository<UserPosition>
  ){}

  async create(createUserPositionInput: CreateUserPositionInput) {
    
    const created = this.repository.create(createUserPositionInput)
    return await this.repository.save(created)
  }

  async getAllByUser(userId:number){
    return this.repository.find({
      where: {
        userId
      },
      relations: ['position', 'position.department']
    })
  }

  // findAll() {
  //   return `This action returns all userPositions`;
  // }

  // findOne(id: number) {
  //   return `This action returns a #${id} userPosition`;
  // }

  // update(id: number, updateUserPositionInput: UpdateUserPositionInput) {
  //   return `This action updates a #${id} userPosition`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} userPosition`;
  // }
}
