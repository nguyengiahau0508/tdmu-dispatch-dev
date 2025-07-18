import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserPositions } from './user-positions';

describe('UserPositions', () => {
  let component: UserPositions;
  let fixture: ComponentFixture<UserPositions>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserPositions]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserPositions);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
