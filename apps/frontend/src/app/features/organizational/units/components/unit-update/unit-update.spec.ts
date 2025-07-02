import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnitUpdate } from './unit-update';

describe('UnitUpdate', () => {
  let component: UnitUpdate;
  let fixture: ComponentFixture<UnitUpdate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UnitUpdate]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UnitUpdate);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
