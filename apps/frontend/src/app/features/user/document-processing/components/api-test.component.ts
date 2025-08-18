import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DocumentProcessingApolloService } from '../services/document-processing-apollo.service';

@Component({
  selector: 'app-api-test',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="api-test">
      <h2>API Test - Document Processing History</h2>
      
      <div class="test-form">
        <label>Document ID:</label>
        <input type="number" [(ngModel)]="documentId" placeholder="Enter Document ID" />
        <button (click)="testAPI()" [disabled]="isLoading">
          {{ isLoading ? 'Testing...' : 'Test API' }}
        </button>
      </div>

      @if (result) {
        <div class="result">
          <h3>API Result:</h3>
          <pre>{{ result | json }}</pre>
        </div>
      }

      @if (error) {
        <div class="error">
          <h3>Error:</h3>
          <pre>{{ error | json }}</pre>
        </div>
      }
    </div>
  `,
  styles: [`
    .api-test {
      padding: 20px;
      max-width: 800px;
      margin: 0 auto;
    }

    .test-form {
      display: flex;
      gap: 10px;
      align-items: center;
      margin-bottom: 20px;
      padding: 15px;
      background: #f9fafb;
      border-radius: 8px;
    }

    input {
      padding: 8px 12px;
      border: 1px solid #d1d5db;
      border-radius: 4px;
    }

    button {
      padding: 8px 16px;
      background: #3b82f6;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }

    button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .result, .error {
      margin-top: 20px;
      padding: 15px;
      border-radius: 8px;
    }

    .result {
      background: #f0f9ff;
      border: 1px solid #bae6fd;
    }

    .error {
      background: #fef2f2;
      border: 1px solid #fecaca;
    }

    pre {
      white-space: pre-wrap;
      word-break: break-word;
      font-size: 12px;
    }
  `]
})
export class ApiTestComponent implements OnInit {
  documentId: number = 1;
  result: any = null;
  error: any = null;
  isLoading = false;

  constructor(private documentProcessingService: DocumentProcessingApolloService) {}

  ngOnInit(): void {
    // Auto test với document ID 1
    this.testAPI();
  }

  testAPI(): void {
    this.isLoading = true;
    this.result = null;
    this.error = null;

    console.log('Testing API with document ID:', this.documentId);

    this.documentProcessingService.getDocumentProcessingHistory(this.documentId).subscribe({
      next: (response) => {
        this.result = response;
        this.isLoading = false;
        console.log('API Success:', response);
      },
      error: (error) => {
        this.error = error;
        this.isLoading = false;
        console.error('API Error:', error);
      }
    });
  }
}
