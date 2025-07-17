import { Module } from '@nestjs/common';
import { UserPositionsService } from './user-positions.service';
import { UserPositionsResolver } from './user-positions.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserPosition } from './entities/user-position.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserPosition])],
  providers: [UserPositionsResolver, UserPositionsService],
})
export class UserPositionsModule {}
