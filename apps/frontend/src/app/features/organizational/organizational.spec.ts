import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Organizational } from './organizational';

describe('Organizational', () => {
  let component: Organizational;
  let fixture: ComponentFixture<Organizational>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Organizational]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Organizational);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
