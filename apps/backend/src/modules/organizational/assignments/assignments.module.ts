import { Module } from '@nestjs/common';
import { AssignmentsService } from './assignments.service';
import { AssignmentsResolver } from './assignments.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Assignment } from './entities/assignment.entity';
import { UsersModule } from '../../users/users.module';
import { PositionsModule } from '../positions/positions.module';
import { UnitsModule } from '../units/units.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Assignment]),
    UsersModule,
    PositionsModule,
    UnitsModule,
  ],
  providers: [AssignmentsResolver, AssignmentsService],
})
export class AssignmentsModule {}
