import { Module } from '@nestjs/common';
import { UnitTypesService } from './unit-types.service';
import { UnitTypesResolver } from './unit-types.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UnitType } from './entities/unit-type.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UnitType])],
  providers: [UnitTypesResolver, UnitTypesService],
})
export class UnitTypesModule { }
