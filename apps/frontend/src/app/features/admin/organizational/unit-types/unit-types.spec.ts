import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnitTypes } from './unit-types';

describe('UnitTypes', () => {
  let component: UnitTypes;
  let fixture: ComponentFixture<UnitTypes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UnitTypes]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UnitTypes);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
