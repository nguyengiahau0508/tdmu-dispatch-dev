import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DepartmentManagementPositions } from './department-management-positions';

describe('DepartmentManagementPositions', () => {
  let component: DepartmentManagementPositions;
  let fixture: ComponentFixture<DepartmentManagementPositions>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DepartmentManagementPositions]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DepartmentManagementPositions);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
