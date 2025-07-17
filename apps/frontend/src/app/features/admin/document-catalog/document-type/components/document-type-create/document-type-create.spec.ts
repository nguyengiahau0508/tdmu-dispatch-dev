import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentTypeCreate } from './document-type-create';

describe('DocumentTypeCreate', () => {
  let component: DocumentTypeCreate;
  let fixture: ComponentFixture<DocumentTypeCreate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocumentTypeCreate]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DocumentTypeCreate);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
