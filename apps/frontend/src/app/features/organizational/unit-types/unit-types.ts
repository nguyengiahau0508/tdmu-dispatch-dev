import { Component } from '@angular/core';
import { UnitTypeCreate } from './components/unit-type-create/unit-type-create';

@Component({
  selector: 'app-unit-types',
  imports: [UnitTypeCreate],
  templateUrl: './unit-types.html',
  styleUrl: './unit-types.css'
})
export class UnitTypes {
  isUnitTypeCreateOpen = false
  toggleUnitTypeCreate() {
    this.isUnitTypeCreateOpen = !this.isUnitTypeCreateOpen
  }
}
