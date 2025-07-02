import { Routes } from "@angular/router";
import { Units } from "./units/units";
import { UnitTypes } from "./unit-types/unit-types";
import { Positions } from "./positions/positions";

export const organizationalRoutes: Routes = [
  { path: 'units', component: Units },
  { path: 'unit-types', component: UnitTypes },
  { path: 'positions', component: Positions }
]
