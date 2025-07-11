import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { CreateUserInput } from './dto/create-user/create-user.input';
import { UpdateUserInput } from './dto/update-user/update-user.input';
import { Like } from 'typeorm';
import { Role } from 'src/common/enums/role.enums';
import { GetUsersPaginatedInput } from './dto/get-users-paginated/get-users-paginated.input';
import { PageMetaDto } from 'src/common/shared/pagination/page-meta.dto';
import { PageDto } from 'src/common/shared/pagination/page.dto';
import { GoogleDriveService } from 'src/integrations/google-drive/google-drive.service';
import { FileUpload } from 'graphql-upload-ts';
import { FilesService } from '../files/files.service';

const SALT_OR_ROUNDS = 10;

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly repository: Repository<User>,
    private readonly googleDriveService: GoogleDriveService,
    private filesService: FilesService
  ) { }

  async create(createUserInput: CreateUserInput, avatarImageFile?: FileUpload): Promise<User> {
    let avatarDriveFileId: string | undefined = undefined
    if (avatarImageFile) {
      const fileId = await this.googleDriveService.uploadFile(avatarImageFile)
      avatarDriveFileId = fileId
    }

    const existing = await this.findOneByEmail(createUserInput.email);
    if (existing) throw new BadRequestException(`Email đã được sử`);

    const hash = await bcrypt.hash(createUserInput.password, SALT_OR_ROUNDS);
    const newUser = this.repository.create({
      ...createUserInput,
      passwordHash: hash,
      avatarFile: avatarDriveFileId ? {
        driveFileId: avatarDriveFileId,
        isPublic: true,
        mimeType: avatarImageFile?.mimetype,
        originalName: avatarImageFile?.filename
      } : undefined
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
        id,
      },
      relations: {
        assignments: true,
      }
    })
  }


  async update(
    id: number,
    updateUserInput: UpdateUserInput,
    avatarImageFile?: FileUpload
  ): Promise<User> {
    const user = await this.repository.findOne({
      where: { id },
      relations: { avatarFile: true }, // đảm bảo load avatarFile
    });
    if (!user) throw new BadRequestException(`User with ID ${id} not found`);
    // Không cho phép cập nhật password qua update này

    // Logic xử lý avatar file mới
    if (avatarImageFile) {
      const newDriveFileId = await this.googleDriveService.uploadFile(avatarImageFile);

      // Nếu user đã có file cũ => Xóa file cũ khỏi Drive
      if (user.avatarFile) {
        await this.googleDriveService.deleteFile(user.avatarFile.driveFileId);
      }

      // Tạo File entity mới
      const newAvatarFile = this.filesService.create({
        driveFileId: newDriveFileId,
        isPublic: true,
        mimeType: avatarImageFile.mimetype,
        originalName: avatarImageFile.filename,
        allowedUserIds: [], // hoặc null/undefined tùy thiết kế
      });
      user.avatarFile = newAvatarFile;
    }

    // Update các trường khác
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

  async findPaginated(input: GetUsersPaginatedInput): Promise<PageDto<User>> {
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
    const [data, itemCount] = await this.repository.findAndCount({
      where,
      skip,
      take,
    });

    // Tạo metadata cho phân trang
    const pageMetaDto = new PageMetaDto({ pageOptionsDto: input, itemCount });
    return new PageDto(data, pageMetaDto);
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

  async addRole(id: number, role: Role): Promise<User> {
    const user = await this.repository.findOne({ where: { id } });
    if (!user) throw new BadRequestException(`User with ID ${id} not found`);

    // Kiểm tra xem role đã tồn tại chưa
    if (user.roles && user.roles.includes(role)) {
      throw new BadRequestException(`User đã có role ${role}`);
    }

    // Thêm role mới vào danh sách
    user.roles = user.roles ? [...user.roles, role] : [role];
    const updated = await this.repository.save(user);
    return updated;
  }

  async removeRole(id: number, role: Role): Promise<User> {
    const user = await this.repository.findOne({ where: { id } });
    if (!user) throw new BadRequestException(`User with ID ${id} not found`);

    // Kiểm tra xem role có tồn tại không
    if (!user.roles || !user.roles.includes(role)) {
      throw new BadRequestException(`User không có role ${role}`);
    }

    // Kiểm tra không cho phép xóa BASIC_USER role (role cơ bản)
    if (role === Role.BASIC_USER) {
      throw new BadRequestException(`Không thể xóa role ${Role.BASIC_USER} - đây là role cơ bản`);
    }

    // Xóa role khỏi danh sách
    user.roles = user.roles.filter(r => r !== role);

    // Đảm bảo user luôn có ít nhất một role
    if (user.roles.length === 0) {
      user.roles = [Role.BASIC_USER];
    }

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

  async getRoles(id: number): Promise<Role[]> {
    const user = await this.repository.findOne({ where: { id } });
    if (!user) throw new BadRequestException(`User with ID ${id} not found`);
    return user.roles || [];
  }
}
