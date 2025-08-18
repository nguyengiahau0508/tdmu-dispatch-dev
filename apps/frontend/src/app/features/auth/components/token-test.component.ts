import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TokenRefreshHttpService } from '../../../core/services/token-refresh-http.service';
import { AuthState } from '../../../core/state/auth.state';
import { DocumentsService } from '../../../core/services/dispatch/documents.service';

@Component({
  selector: 'app-token-test',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="token-test">
      <h3>Test Token Refresh Functionality</h3>
      
      <div class="token-info">
        <h4>Token Information</h4>
        <div class="info-grid">
          <div class="info-item">
            <strong>Access Token:</strong>
            <span class="token-preview">{{ getTokenPreview(authState.getAccessToken()) }}</span>
            <span class="status" [class]="getTokenStatusClass()">{{ getTokenStatus() }}</span>
          </div>
          <div class="info-item">
            <strong>Refresh Token:</strong>
            <span class="token-preview">{{ getTokenPreview(authState.getRefreshToken()) }}</span>
          </div>
          <div class="info-item">
            <strong>Is Authenticated:</strong>
            <span class="status" [class]="authState.isAuthenticated() ? 'valid' : 'invalid'">
              {{ authState.isAuthenticated() ? 'Yes' : 'No' }}
            </span>
          </div>
          <div class="info-item">
            <strong>Token Expiring Soon:</strong>
            <span class="status" [class]="getExpiringStatusClass()">
              {{ getExpiringStatus() }}
            </span>
          </div>
        </div>
      </div>

      <div class="test-actions">
        <h4>Test Actions</h4>
        <div class="action-buttons">
          <button (click)="testRefreshToken()" [disabled]="isRefreshing" class="btn btn-primary">
            {{ isRefreshing ? 'Refreshing...' : 'Manual Refresh Token' }}
          </button>
          
          <button (click)="testProactiveRefresh()" [disabled]="isRefreshing" class="btn btn-secondary">
            Test Proactive Refresh
          </button>
          
          <button (click)="testApiCall()" [disabled]="isApiCalling" class="btn btn-success">
            {{ isApiCalling ? 'Calling API...' : 'Test API Call' }}
          </button>
          
          <button (click)="clearTokens()" class="btn btn-danger">
            Clear Tokens
          </button>
        </div>
      </div>

      <div class="test-results">
        <h4>Test Results</h4>
        @if (testResults.length > 0) {
          <div class="results-list">
            @for (result of testResults; track result.id) {
              <div class="result-item" [class]="result.type">
                <div class="result-header">
                  <span class="result-time">{{ result.timestamp | date:'HH:mm:ss' }}</span>
                  <span class="result-type">{{ result.type.toUpperCase() }}</span>
                </div>
                <div class="result-message">{{ result.message }}</div>
                @if (result.details) {
                  <div class="result-details">
                    <pre>{{ result.details | json }}</pre>
                  </div>
                }
              </div>
            }
          </div>
        } @else {
          <p class="no-results">No test results yet. Run some tests to see results here.</p>
        }
      </div>
    </div>
  `,
  styles: [`
    .token-test {
      padding: 20px;
      max-width: 800px;
      margin: 0 auto;
    }

    .token-info, .test-actions, .test-results {
      margin-bottom: 30px;
      padding: 20px;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      background: white;
    }

    .info-grid {
      display: grid;
      gap: 15px;
    }

    .info-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px;
      background: #f9fafb;
      border-radius: 6px;
    }

    .token-preview {
      font-family: monospace;
      background: #f3f4f6;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      max-width: 200px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .status {
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 500;
    }

    .status.valid { background: #d1fae5; color: #065f46; }
    .status.invalid { background: #fee2e2; color: #991b1b; }
    .status.expiring { background: #fef3c7; color: #92400e; }
    .status.expired { background: #fee2e2; color: #991b1b; }

    .action-buttons {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }

    .btn {
      padding: 10px 16px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 500;
      transition: all 0.2s;
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-primary { background: #3b82f6; color: white; }
    .btn-primary:hover:not(:disabled) { background: #2563eb; }
    
    .btn-secondary { background: #6b7280; color: white; }
    .btn-secondary:hover:not(:disabled) { background: #4b5563; }
    
    .btn-success { background: #10b981; color: white; }
    .btn-success:hover:not(:disabled) { background: #059669; }
    
    .btn-danger { background: #ef4444; color: white; }
    .btn-danger:hover:not(:disabled) { background: #dc2626; }

    .results-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .result-item {
      padding: 15px;
      border-radius: 6px;
      border-left: 4px solid;
    }

    .result-item.success {
      background: #f0f9ff;
      border-left-color: #3b82f6;
    }

    .result-item.error {
      background: #fef2f2;
      border-left-color: #ef4444;
    }

    .result-item.info {
      background: #f0f9ff;
      border-left-color: #06b6d4;
    }

    .result-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }

    .result-time {
      font-size: 12px;
      color: #6b7280;
    }

    .result-type {
      font-size: 12px;
      font-weight: 600;
      padding: 2px 6px;
      border-radius: 4px;
      background: rgba(0,0,0,0.1);
    }

    .result-message {
      margin-bottom: 8px;
    }

    .result-details {
      background: #f9fafb;
      padding: 10px;
      border-radius: 4px;
      font-size: 12px;
      font-family: monospace;
      overflow-x: auto;
    }

    .no-results {
      color: #6b7280;
      font-style: italic;
      text-align: center;
      padding: 20px;
    }
  `]
})
export class TokenTestComponent implements OnInit {
  isRefreshing = false;
  isApiCalling = false;
  testResults: Array<{
    id: number;
    type: 'success' | 'error' | 'info';
    message: string;
    details?: any;
    timestamp: Date;
  }> = [];

  constructor(
    public authState: AuthState,
    private tokenRefreshService: TokenRefreshHttpService,
    private documentsService: DocumentsService
  ) {}

  ngOnInit(): void {
    this.addResult('info', 'Token test component initialized');
  }

  testRefreshToken(): void {
    this.isRefreshing = true;
    this.addResult('info', 'Starting manual token refresh...');

    this.tokenRefreshService.refreshToken().then(
      (newToken) => {
        this.addResult('success', 'Token refreshed successfully', { newToken: this.getTokenPreview(newToken) });
        this.isRefreshing = false;
      },
      (error) => {
        this.addResult('error', 'Token refresh failed', { error: error.message });
        this.isRefreshing = false;
      }
    );
  }

  testProactiveRefresh(): void {
    this.addResult('info', 'Testing proactive refresh...');
    
    this.tokenRefreshService.proactiveRefresh().subscribe({
      next: (token: string | null) => {
        this.addResult('success', 'Proactive refresh completed', { token: this.getTokenPreview(token) });
      },
      error: (error: any) => {
        this.addResult('error', 'Proactive refresh failed', { error: error.message });
      }
    });
  }

  testApiCall(): void {
    this.isApiCalling = true;
    this.addResult('info', 'Testing API call with automatic token refresh...');

    this.documentsService.getDocumentsPaginated({
      page: 1,
      take: 5,
      order: 'DESC'
    }).subscribe({
      next: (response) => {
        this.addResult('success', 'API call successful', { 
          documentCount: response.data?.length || 0,
          totalCount: response.totalCount 
        });
        this.isApiCalling = false;
      },
      error: (error) => {
        this.addResult('error', 'API call failed', { error: error.message });
        this.isApiCalling = false;
      }
    });
  }

  clearTokens(): void {
    this.authState.clearAllTokens();
    this.addResult('info', 'All tokens cleared');
  }

  getTokenPreview(token: string | null): string {
    if (!token) return 'No token';
    return token.length > 20 ? `${token.substring(0, 20)}...` : token;
  }

  getTokenStatus(): string {
    const token = this.authState.getAccessToken();
    if (!token) return 'No Token';
    
    if (this.tokenRefreshService.isTokenValid(token)) {
      return 'Valid';
    } else {
      return 'Expired';
    }
  }

  getTokenStatusClass(): string {
    const token = this.authState.getAccessToken();
    if (!token) return 'invalid';
    
    if (this.tokenRefreshService.isTokenValid(token)) {
      return 'valid';
    } else {
      return 'expired';
    }
  }

  getExpiringStatus(): string {
    const token = this.authState.getAccessToken();
    if (!token) return 'No Token';
    
    if (this.tokenRefreshService.isTokenExpiringSoon(token)) {
      return 'Yes (within 5 minutes)';
    } else {
      return 'No';
    }
  }

  getExpiringStatusClass(): string {
    const token = this.authState.getAccessToken();
    if (!token) return 'invalid';
    
    if (this.tokenRefreshService.isTokenExpiringSoon(token)) {
      return 'expiring';
    } else {
      return 'valid';
    }
  }

  private addResult(type: 'success' | 'error' | 'info', message: string, details?: any): void {
    this.testResults.unshift({
      id: Date.now(),
      type,
      message,
      details,
      timestamp: new Date()
    });

    // Giữ tối đa 10 kết quả
    if (this.testResults.length > 10) {
      this.testResults = this.testResults.slice(0, 10);
    }
  }
}
