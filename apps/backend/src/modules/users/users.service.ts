import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { CreateUserInput } from './dto/create-user/create-user.input';
import { UpdateUserInput } from './dto/update-user/update-user.input';
import { Metadata } from 'src/common/graphql/metadata.dto';
import { Like } from 'typeorm';
import { Role } from 'src/common/enums/role.enums';
import { GetUsersPaginatedInput } from './dto/get-users-paginated/get-users-paginated.input';
import { GetUsersPaginatedResponse } from './dto/get-users-paginated/get-users-paginated.response';

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

  async update(id: number, updateUserInput: UpdateUserInput): Promise<User> {
    const user = await this.repository.findOne({ where: { id } });
    if (!user) throw new BadRequestException(`User with ID ${id} not found`);
    // Không cho phép cập nhật password qua update này
    if (updateUserInput.email !== undefined) user.email = updateUserInput.email;
    if (updateUserInput.firstName !== undefined) user.firstName = updateUserInput.firstName;
    if (updateUserInput.lastName !== undefined) user.lastName = updateUserInput.lastName;
    if (updateUserInput.isActive !== undefined) user.isActive = updateUserInput.isActive;
    if (updateUserInput.avatar !== undefined) user.avatar = updateUserInput.avatar;
    if (updateUserInput.roles !== undefined) user.roles = updateUserInput.roles;
    const updated = await this.repository.save(user);
    return updated;
  }

  async remove(id: number): Promise<User> {
    const user = await this.repository.findOne({ where: { id } });
    if (!user) throw new BadRequestException(`User with ID ${id} not found`);
    user.isActive = false;
    const updated = await this.repository.save(user);
    return updated;
  }

  async findPaginated(input: GetUsersPaginatedInput): Promise<GetUsersPaginatedResponse> {
    const { search, skip, take = 10, role, isActive } = input;
    const where: any = {};
    if (search) {
      where["email"] = Like(`%${search}%`);
      // Có thể mở rộng tìm theo tên
    }
    if (role) {
      where["roles"] = role;
    }
    if (typeof isActive === 'boolean') {
      where["isActive"] = isActive;
    }
    const [data, totalCount] = await this.repository.findAndCount({
      where,
      skip,
      take,
    });
    const metadata: Metadata = {
      statusCode: 200,
      message: 'Lấy danh sách user phân trang thành công',
      timestamp: new Date().toISOString(),
      path: '',
    };
    return {
      data,
      metadata,
      totalCount,
      hasNextPage: skip + take < totalCount,
    };
  }

  async resetPassword(id: number): Promise<User> {
    const user = await this.repository.findOne({ where: { id } });
    if (!user) throw new BadRequestException(`User with ID ${id} not found`);
    // Đặt lại mật khẩu về giá trị mặc định (cần hash)
    const hash = await bcrypt.hash('12345678', SALT_OR_ROUNDS); // Có thể lấy từ config
    user.passwordHash = hash;
    user.isFirstLogin = true;
    const updated = await this.repository.save(user);
    return updated;
  }

  async changeRoles(id: number, roles: Role[]): Promise<User> {
    const user = await this.repository.findOne({ where: { id } });
    if (!user) throw new BadRequestException(`User with ID ${id} not found`);
    user.roles = roles;
    const updated = await this.repository.save(user);
    return updated;
  }

  async findByRole(role: Role): Promise<User[]> {
    return this.repository.createQueryBuilder('user')
      .where(':role = ANY(user.roles)', { role })
      .getMany();
  }

  async checkEmailExists(email: string): Promise<boolean> {
    const user = await this.repository.findOne({ where: { email } });
    return !!user;
  }

  async statistics(): Promise<{ byRole: Record<string, number>, byStatus: { active: number, inactive: number } }> {
    const users = await this.repository.find();
    const byRole: Record<string, number> = {};
    users.forEach(u => {
      (u.roles || []).forEach(role => {
        byRole[role] = (byRole[role] || 0) + 1;
      });
    });
    const byStatus = {
      active: users.filter(u => u.isActive).length,
      inactive: users.filter(u => !u.isActive).length
    };
    return { byRole, byStatus };
  }
}
