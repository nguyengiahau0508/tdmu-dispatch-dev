import { Module } from '@nestjs/common';
import { UnitsService } from './units.service';
import { UnitsResolver } from './units.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Unit } from './entities/unit.entity';
import { UnitType } from '../unit-types/entities/unit-type.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Unit, UnitType])],
  providers: [UnitsResolver, UnitsService],
})
export class UnitsModule { }
