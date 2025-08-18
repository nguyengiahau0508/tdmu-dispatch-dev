import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DocumentProcessingApolloService } from '../services/document-processing-apollo.service';

@Component({
  selector: 'app-simple-test',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="simple-test">
      <h3>Simple API Test</h3>
      <p>Testing if the ActionType enum error is fixed...</p>
      
      @if (isLoading) {
        <p>Loading...</p>
      } @else if (error) {
        <div class="error">
          <p><strong>Error:</strong> {{ error }}</p>
          <p><strong>Error Type:</strong> {{ getErrorType(error) }}</p>
        </div>
      } @else if (success) {
        <div class="success">
          <p><strong>Success!</strong> API is working correctly.</p>
          <p>Response: {{ success }}</p>
        </div>
      }
      
      <button (click)="testAPI()" [disabled]="isLoading">
        {{ isLoading ? 'Testing...' : 'Test API' }}
      </button>
    </div>
  `,
  styles: [`
    .simple-test {
      padding: 20px;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      margin: 20px;
    }
    
    .error {
      background: #fef2f2;
      border: 1px solid #fecaca;
      padding: 12px;
      border-radius: 6px;
      margin: 12px 0;
    }
    
    .success {
      background: #f0f9ff;
      border: 1px solid #bae6fd;
      padding: 12px;
      border-radius: 6px;
      margin: 12px 0;
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
  `]
})
export class SimpleTestComponent implements OnInit {
  isLoading = false;
  error: string | null = null;
  success: string | null = null;

  constructor(private documentProcessingService: DocumentProcessingApolloService) {}

  ngOnInit(): void {
    // Auto test khi component load
    setTimeout(() => {
      this.testAPI();
    }, 1000);
  }

  testAPI(): void {
    this.isLoading = true;
    this.error = null;
    this.success = null;

    console.log('Testing document processing history API...');

    this.documentProcessingService.getDocumentProcessingHistory(1).subscribe({
      next: (response) => {
        this.success = 'API call successful - ActionType enum error is fixed!';
        this.isLoading = false;
        console.log('✅ API Success:', response);
      },
      error: (error) => {
        this.error = error.message || 'Unknown error';
        this.isLoading = false;
        console.error('❌ API Error:', error);
        
        // Check if it's the ActionType enum error
        if (error.message && error.message.includes('ActionType')) {
          this.error = '❌ ActionType enum error still exists: ' + error.message;
        } else if (error.message && error.message.includes('Unauthorized')) {
          this.error = '✅ Good! API is working, just needs authentication. ActionType enum error is fixed!';
        } else {
          this.error = '⚠️ Other error: ' + error.message;
        }
      }
    });
  }

  getErrorType(error: any): string {
    if (error.message && error.message.includes('ActionType')) {
      return 'ActionType Enum Error';
    } else if (error.message && error.message.includes('Unauthorized')) {
      return 'Authentication Error (Expected)';
    } else {
      return 'Other Error';
    }
  }
}
