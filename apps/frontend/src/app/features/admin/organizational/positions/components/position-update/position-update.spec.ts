import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PositionUpdate } from './position-update';

describe('PositionUpdate', () => {
  let component: PositionUpdate;
  let fixture: ComponentFixture<PositionUpdate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PositionUpdate]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PositionUpdate);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
