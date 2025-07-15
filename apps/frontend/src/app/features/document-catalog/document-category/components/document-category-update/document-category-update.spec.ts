import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentCategoryUpdate } from './document-category-update';

describe('DocumentCategoryUpdate', () => {
  let component: DocumentCategoryUpdate;
  let fixture: ComponentFixture<DocumentCategoryUpdate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocumentCategoryUpdate]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DocumentCategoryUpdate);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
