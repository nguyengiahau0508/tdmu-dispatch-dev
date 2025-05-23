// src/modules/users/users.service.ts
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import * as bcrypt from 'bcrypt'; // Cần cài: npm install bcrypt @types/bcrypt

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) { }

  async create(createUserInput: CreateUserInput): Promise<User> {
    const existingUser = await this.usersRepository.findOne({
      where: { email: createUserInput.email },
    });
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const saltRounds = 10; // Hoặc lấy từ config
    const hashedPassword = await bcrypt.hash(createUserInput.password, saltRounds);

    const newUser = this.usersRepository.create({
      ...createUserInput,
      passwordHash: hashedPassword, // Lưu password đã hash
    });
    return this.usersRepository.save(newUser);
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async findOneById(id: string): Promise<User | null> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }
    return user;
  }

  async findOneByEmail(email: string): Promise<User | null> {
    // Cẩn thận khi expose query này, có thể cần quyền admin
    return this.usersRepository.findOne({ where: { email } });
  }

}
