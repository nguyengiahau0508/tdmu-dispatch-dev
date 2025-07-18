import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserPositionUpdate } from './user-position-update';

describe('UserPositionUpdate', () => {
  let component: UserPositionUpdate;
  let fixture: ComponentFixture<UserPositionUpdate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserPositionUpdate]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserPositionUpdate);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
