import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { CreateUserInput } from './dto/create-user/create-user.input';
import { UpdateUserInput } from './dto/update-user/update-user.input';

const SALT_OR_ROUNDS = 10;

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly repository: Repository<User>
  ) { }

  async create(createUserInput: CreateUserInput): Promise<User> {
    const existing = await this.findOneByEmail(createUserInput.email);
    if (existing) throw new BadRequestException(`Email đã được sử`);

    const hash = await bcrypt.hash(createUserInput.password, SALT_OR_ROUNDS);
    const newUser = this.repository.create({
      ...createUserInput,
      passwordHash: hash
    })
    const savedNewUser = await this.repository.save(newUser);
    if (!savedNewUser) throw new InternalServerErrorException()

    return savedNewUser;
  }

  async findOneByEmail(email: string) {
    return await this.repository.findOne({
      where: {
        email
      }
    })
  }

  async changePassword(userId: number, newPassword: string) {
    const hash = await bcrypt.hash(newPassword, SALT_OR_ROUNDS);
    return this.repository.update(userId, { passwordHash: hash })
  }

  async setFalseForFistLogin(userId: number) {
    return this.repository.update(userId, { isFirstLogin: false })
  }

  findAll() {
    return this.repository.find()
  }

  findOneById(id: number) {
    return this.repository.findOne({
      where: {
        id
      }
    })
  }

  update(id: number, updateUserInput: UpdateUserInput) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
