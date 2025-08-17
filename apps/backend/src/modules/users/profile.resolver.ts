import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from 'src/auth/guards/gql-auth.guard';
import { CurrentUser } from 'src/common/decorators/user.decorator';
import { User } from './entities/user.entity';
import { ProfileService } from './profile.service';
import { UpdateProfileInput } from './dto/update-profile/update-profile.input';
import { UpdateProfileResponse } from './dto/update-profile/update-profile.response';
import { GetUserActivitiesInput } from './dto/get-user-activities/get-user-activities.input';
import { GetUserActivitiesResponse } from './dto/get-user-activities/get-user-activities.response';
import { UploadAvatarResponse } from './dto/upload-avatar/upload-avatar.response';
import { FileUpload, GraphQLUpload } from 'graphql-upload-ts';
import { createResponseMetadata } from 'src/common/helpers/metadata.helper';
import { HttpStatus } from '@nestjs/common';
import { PageMetaDto } from 'src/common/shared/pagination/page-meta.dto';
import { Req } from '@nestjs/common';
import { Request } from 'express';

@Resolver(() => User)
@UseGuards(GqlAuthGuard)
export class ProfileResolver {
  constructor(private readonly profileService: ProfileService) {}

  @Mutation(() => UpdateProfileResponse)
  async updateProfile(
    @Args('input') input: UpdateProfileInput,
    @CurrentUser() user: User,
    @Req() request: Request,
  ): Promise<UpdateProfileResponse> {
    const updatedUser = await this.profileService.updateProfile(
      user.id,
      input,
      request,
    );

    return {
      metadata: createResponseMetadata(
        HttpStatus.OK,
        'Cập nhật profile thành công',
      ),
      data: updatedUser,
    };
  }

  @Mutation(() => UploadAvatarResponse)
  async uploadAvatar(
    @Args({
      name: 'avatarFile',
      type: () => GraphQLUpload,
    })
    avatarFile: FileUpload,
    @CurrentUser() user: User,
    @Req() request: Request,
  ): Promise<UploadAvatarResponse> {
    const updatedUser = await this.profileService.uploadAvatar(
      user.id,
      avatarFile,
      request,
    );

    return {
      metadata: createResponseMetadata(
        HttpStatus.OK,
        'Upload avatar thành công',
      ),
      data: updatedUser,
    };
  }

  @Mutation(() => UploadAvatarResponse)
  async removeAvatar(
    @CurrentUser() user: User,
    @Req() request: Request,
  ): Promise<UploadAvatarResponse> {
    const updatedUser = await this.profileService.removeAvatar(
      user.id,
      request,
    );

    return {
      metadata: createResponseMetadata(
        HttpStatus.OK,
        'Xóa avatar thành công',
      ),
      data: updatedUser,
    };
  }

  @Query(() => GetUserActivitiesResponse)
  async getUserActivities(
    @Args('input') input: GetUserActivitiesInput,
    @CurrentUser() user: User,
  ): Promise<GetUserActivitiesResponse> {
    const { activities, total } = await this.profileService.getUserActivities(
      user.id,
      input,
    );

    const page = input.page || 1;
    const limit = input.limit || 10;
    const pageMeta = new PageMetaDto({
      pageOptionsDto: {
        page,
        take: limit,
        skip: (page - 1) * limit,
      },
      itemCount: total,
    });

    return {
      metadata: createResponseMetadata(
        HttpStatus.OK,
        'Lấy lịch sử hoạt động thành công',
      ),
      data: activities,
      meta: pageMeta,
    };
  }

  @Query(() => User, { name: 'myProfile' })
  async getMyProfile(@CurrentUser() user: User): Promise<User> {
    return user;
  }

  @Query(() => User, { name: 'userProfile' })
  async getUserProfile(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<User> {
    // TODO: Implement logic to get public profile of other users
    // This should respect privacy settings
    throw new Error('Chức năng này chưa được implement');
  }

  @Query(() => String, { name: 'profileStats' })
  async getProfileStats(@CurrentUser() user: User): Promise<string> {
    const stats = await this.profileService.getProfileStats(user.id);
    return JSON.stringify(stats);
  }
}
