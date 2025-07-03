import { Module } from "@nestjs/common";
import { UnitsModule } from "./units/units.module";
import { UnitTypesModule } from "./unit-types/unit-types.module";
import { PositionsModule } from './positions/positions.module';
import { AssignmentsModule } from './assignments/assignments.module';

@Module({
  imports: [
    UnitsModule,
    UnitTypesModule,
    PositionsModule,
    AssignmentsModule
  ]
})
export class OraganizationalModule { }
