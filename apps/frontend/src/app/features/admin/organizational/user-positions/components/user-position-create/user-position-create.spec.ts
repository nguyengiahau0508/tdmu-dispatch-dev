import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserPositionCreate } from './user-position-create';

describe('UserPositionCreate', () => {
  let component: UserPositionCreate;
  let fixture: ComponentFixture<UserPositionCreate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserPositionCreate]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserPositionCreate);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
