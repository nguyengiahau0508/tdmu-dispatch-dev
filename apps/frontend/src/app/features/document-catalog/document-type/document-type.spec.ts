import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentType } from './document-type';

describe('DocumentType', () => {
  let component: DocumentType;
  let fixture: ComponentFixture<DocumentType>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocumentType]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DocumentType);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
