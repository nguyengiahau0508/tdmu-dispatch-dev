import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppsLauncher } from './apps-launcher';

describe('AppsLauncher', () => {
  let component: AppsLauncher;
  let fixture: ComponentFixture<AppsLauncher>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppsLauncher]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppsLauncher);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
