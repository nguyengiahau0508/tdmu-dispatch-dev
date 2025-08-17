import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersResolver } from './users.resolver';
import { ProfileService } from './profile.service';
import { ProfileResolver } from './profile.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserActivity } from './entities/user-activity.entity';
import { GoogleDriveModule } from 'src/integrations/google-drive/google-drive.module';
import { FilesModule } from '../files/files.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserActivity]), 
    GoogleDriveModule, 
    FilesModule
  ],
  providers: [UsersResolver, UsersService, ProfileResolver, ProfileService],
  exports: [UsersService, ProfileService],
})
export class UsersModule {}
