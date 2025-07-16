import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DepartmentUpdate } from './department-update';

describe('DepartmentUpdate', () => {
  let component: DepartmentUpdate;
  let fixture: ComponentFixture<DepartmentUpdate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DepartmentUpdate]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DepartmentUpdate);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
