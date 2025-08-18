import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Document } from '../../../core/services/dispatch/documents.service';
import { DocumentsService } from '../../../core/services/dispatch/documents.service';
import { DocumentFormComponent } from '../document-form/document-form.component';

@Component({
  selector: 'app-all-documents',
  templateUrl: './all-documents.component.html',
  styleUrls: ['./all-documents.component.scss'],
  standalone: true,
  imports: [CommonModule, DocumentFormComponent]
})
export class AllDocumentsComponent implements OnInit {
  documents: Document[] = [];
  loading = false;
  selectedDocument?: Document;
  showDocumentForm = false;
  documentToEdit?: Document;

  constructor(
    private documentsService: DocumentsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadDocuments();
  }

  loadDocuments(): void {
    this.loading = true;
    this.documentsService.getDocuments().subscribe({
      next: (response: any) => {
        this.documents = response.data || [];
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading documents:', error);
        this.loading = false;
      }
    });
  }

  onViewDocument(document: Document): void {
    this.selectedDocument = document;
  }

  onEditDocument(document: Document): void {
    console.log('Editing document:', document);
    this.selectedDocument = undefined;
    this.documentToEdit = document;
    this.showDocumentForm = true;
  }

  onDeleteDocument(document: Document): void {
    if (confirm('Bạn có chắc chắn muốn xóa văn bản này?')) {
      this.documentsService.deleteDocument(document.id).subscribe({
        next: () => {
          this.loadDocuments();
        },
        error: (error: any) => {
          console.error('Error deleting document:', error);
        }
      });
    }
  }

  openWorkflowDetail(documentId: number): void {
    this.router.navigate(['/workflow-detail', documentId]);
  }

  onDocumentSaved(): void {
    this.showDocumentForm = false;
    this.documentToEdit = undefined;
    this.loadDocuments();
  }

  onDocumentFormCancelled(): void {
    this.showDocumentForm = false;
    this.documentToEdit = undefined;
  }
}

