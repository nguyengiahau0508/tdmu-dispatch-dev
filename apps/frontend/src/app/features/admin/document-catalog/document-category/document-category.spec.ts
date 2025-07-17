import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentCategory } from './document-category';

describe('DocumentCategory', () => {
  let component: DocumentCategory;
  let fixture: ComponentFixture<DocumentCategory>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocumentCategory]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DocumentCategory);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
