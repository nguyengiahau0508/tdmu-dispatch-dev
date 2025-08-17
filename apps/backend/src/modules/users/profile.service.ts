import {
  Injectable,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { User } from './entities/user.entity';
import { UserActivity, ActivityType } from './entities/user-activity.entity';
import { UpdateProfileInput } from './dto/update-profile/update-profile.input';
import { GetUserActivitiesInput } from './dto/get-user-activities/get-user-activities.input';
import { GoogleDriveService } from 'src/integrations/google-drive/google-drive.service';
import { FileUpload } from 'graphql-upload-ts';
import { FilesService } from '../files/files.service';
import { Request } from 'express';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserActivity)
    private readonly activityRepository: Repository<UserActivity>,
    private readonly googleDriveService: GoogleDriveService,
    private readonly filesService: FilesService,
  ) {}

  async updateProfile(
    userId: number,
    updateProfileInput: UpdateProfileInput,
    request?: Request,
  ): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Người dùng không tồn tại');
    }

    // Kiểm tra email nếu có thay đổi
    if (updateProfileInput.email && updateProfileInput.email !== user.email) {
      const existingUser = await this.userRepository.findOne({
        where: { email: updateProfileInput.email },
      });
      if (existingUser) {
        throw new BadRequestException('Email đã được sử dụng bởi người dùng khác');
      }
    }

    // Cập nhật thông tin
    Object.assign(user, updateProfileInput);
    const updatedUser = await this.userRepository.save(user);

    // Ghi log hoạt động
    await this.logActivity(
      userId,
      ActivityType.PROFILE_UPDATE,
      'Cập nhật thông tin profile',
      { updatedFields: Object.keys(updateProfileInput) },
      request,
    );

    return updatedUser;
  }

  async uploadAvatar(
    userId: number,
    avatarFile: FileUpload,
    request?: Request,
  ): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['avatarFile'],
    });

    if (!user) {
      throw new NotFoundException('Người dùng không tồn tại');
    }

    try {
      // Upload file lên Google Drive
      const driveFileId = await this.googleDriveService.uploadFile(avatarFile);

      // Tạo file entity mới
      const newAvatarFile = await this.filesService.create({
        driveFileId,
        isPublic: true,
        mimeType: avatarFile.mimetype,
        originalName: avatarFile.filename,
      });

      // Cập nhật user với avatar mới
      user.avatarFileId = Number(newAvatarFile.id);
      user.avatarFile = newAvatarFile;
      user.avatar = `https://drive.google.com/uc?id=${driveFileId}`;

      const updatedUser = await this.userRepository.save(user);

      // Ghi log hoạt động
      await this.logActivity(
        userId,
        ActivityType.AVATAR_UPDATE,
        'Cập nhật ảnh đại diện',
        { fileName: avatarFile.filename },
        request,
      );

      return updatedUser;
    } catch (error) {
      throw new InternalServerErrorException('Lỗi khi upload avatar');
    }
  }

  async removeAvatar(userId: number, request?: Request): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['avatarFile'],
    });

    if (!user) {
      throw new NotFoundException('Người dùng không tồn tại');
    }

    // Xóa file cũ nếu có
    if (user.avatarFile) {
      try {
        await this.filesService.remove(Number(user.avatarFile.id));
      } catch (error) {
        // Log lỗi nhưng không throw exception
        console.error('Lỗi khi xóa file avatar cũ:', error);
      }
    }

    // Cập nhật user
    user.avatarFileId = undefined;
    user.avatarFile = undefined;
    user.avatar = '';

    const updatedUser = await this.userRepository.save(user);

    // Ghi log hoạt động
    await this.logActivity(
      userId,
      ActivityType.AVATAR_UPDATE,
      'Xóa ảnh đại diện',
      {},
      request,
    );

    return updatedUser;
  }

  async getUserActivities(
    userId: number,
    input: GetUserActivitiesInput,
  ): Promise<{ activities: UserActivity[]; total: number }> {
    const queryBuilder = this.activityRepository
      .createQueryBuilder('activity')
      .where('activity.userId = :userId', { userId })
      .orderBy('activity.createdAt', 'DESC');

    // Lọc theo loại hoạt động
    if (input.activityType) {
      queryBuilder.andWhere('activity.activityType = :activityType', {
        activityType: input.activityType,
      });
    }

    // Lọc theo khoảng thời gian
    if (input.startDate && input.endDate) {
      queryBuilder.andWhere('activity.createdAt BETWEEN :startDate AND :endDate', {
        startDate: new Date(input.startDate),
        endDate: new Date(input.endDate),
      });
    }

    const total = await queryBuilder.getCount();
    const page = input.page || 1;
    const limit = input.limit || 10;
    const activities = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return { activities, total };
  }

  async logActivity(
    userId: number,
    activityType: ActivityType,
    description?: string,
    metadata?: any,
    request?: Request,
  ): Promise<UserActivity> {
    const activity = this.activityRepository.create({
      userId,
      activityType,
      description,
      metadata: metadata ? JSON.stringify(metadata) : undefined,
      ipAddress: request?.ip,
      userAgent: request?.headers['user-agent'],
    });

    return await this.activityRepository.save(activity);
  }

  async updateLastLogin(userId: number, request?: Request): Promise<void> {
    await this.userRepository.update(userId, {
      lastLoginAt: new Date(),
    });

    // Tăng số lần đăng nhập
    await this.userRepository
      .createQueryBuilder()
      .update(User)
      .set({
        loginCount: () => 'loginCount + 1',
      })
      .where('id = :id', { id: userId })
      .execute();

    // Ghi log hoạt động
    await this.logActivity(
      userId,
      ActivityType.LOGIN,
      'Đăng nhập vào hệ thống',
      {},
      request,
    );
  }

  async getProfileStats(userId: number): Promise<any> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Người dùng không tồn tại');
    }

    // Thống kê hoạt động
    const activityStats = await this.activityRepository
      .createQueryBuilder('activity')
      .select('activity.activityType', 'type')
      .addSelect('COUNT(*)', 'count')
      .where('activity.userId = :userId', { userId })
      .groupBy('activity.activityType')
      .getRawMany();

    // Hoạt động gần đây
    const recentActivities = await this.activityRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: 5,
    });

    return {
      user,
      activityStats,
      recentActivities,
      totalActivities: await this.activityRepository.count({
        where: { userId },
      }),
    };
  }
}
