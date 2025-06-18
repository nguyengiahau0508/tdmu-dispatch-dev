import { Module } from "@nestjs/common";
import { UnitsModule } from "./units/units.module";
import { UnitTypesModule } from "./unit-types/unit-types.module";

@Module({
  imports: [
    UnitsModule,
    UnitTypesModule
  ]
})
export class OraganizationalModule { }
