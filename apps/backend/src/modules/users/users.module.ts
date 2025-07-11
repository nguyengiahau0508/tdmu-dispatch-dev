import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersResolver } from './users.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { GoogleDriveModule } from 'src/integrations/google-drive/google-drive.module';
import { FilesModule } from '../files/files.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    GoogleDriveModule,
    FilesModule
  ],
  providers: [UsersResolver, UsersService],
  exports: [UsersService]
})
export class UsersModule { }
