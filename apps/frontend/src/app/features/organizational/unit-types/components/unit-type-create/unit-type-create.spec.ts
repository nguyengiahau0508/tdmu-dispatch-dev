import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnitTypeCreate } from './unit-type-create';

describe('UnitTypeCreate', () => {
  let component: UnitTypeCreate;
  let fixture: ComponentFixture<UnitTypeCreate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UnitTypeCreate]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UnitTypeCreate);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
