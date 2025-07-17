import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserPoitions } from './user-poitions';

describe('UserPoitions', () => {
  let component: UserPoitions;
  let fixture: ComponentFixture<UserPoitions>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserPoitions]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserPoitions);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
