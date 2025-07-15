import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentCatalog } from './document-catalog';

describe('DocumentCatalog', () => {
  let component: DocumentCatalog;
  let fixture: ComponentFixture<DocumentCatalog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocumentCatalog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DocumentCatalog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
