import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnitTypeUpdate } from './unit-type-update';

describe('UnitTypeUpdate', () => {
  let component: UnitTypeUpdate;
  let fixture: ComponentFixture<UnitTypeUpdate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UnitTypeUpdate]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UnitTypeUpdate);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
