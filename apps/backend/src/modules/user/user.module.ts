// src/modules/users/users.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersService } from './user.service';
import { UsersResolver } from './user.resolver';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]), // Đăng ký User entity với TypeORM
  ],
  providers: [UsersResolver, UsersService],
  exports: [UsersService], // Export UsersService nếu các module khác cần dùng (ví dụ: AuthModule)
})
export class UsersModule { }
