import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentCategoryCreate } from './document-category-create';

describe('DocumentCategoryCreate', () => {
  let component: DocumentCategoryCreate;
  let fixture: ComponentFixture<DocumentCategoryCreate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocumentCategoryCreate]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DocumentCategoryCreate);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
