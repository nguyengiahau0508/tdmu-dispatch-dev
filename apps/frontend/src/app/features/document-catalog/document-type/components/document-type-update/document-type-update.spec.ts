import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentTypeUpdate } from './document-type-update';

describe('DocumentTypeUpdate', () => {
  let component: DocumentTypeUpdate;
  let fixture: ComponentFixture<DocumentTypeUpdate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocumentTypeUpdate]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DocumentTypeUpdate);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
