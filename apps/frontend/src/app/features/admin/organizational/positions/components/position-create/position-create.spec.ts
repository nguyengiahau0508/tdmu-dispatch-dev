import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PositionCreate } from './position-create';

describe('PositionCreate', () => {
  let component: PositionCreate;
  let fixture: ComponentFixture<PositionCreate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PositionCreate]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PositionCreate);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
