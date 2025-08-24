import { Component, EventEmitter, Input, Output, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DigitalSignatureService } from '../services/digital-signature.service';
import { Certificate } from '../services/digital-signature.service';

declare var SignaturePad: any;

// Global SignaturePad from CDN
declare global {
  interface Window {
    SignaturePad: any;
  }
}

@Component({
  selector: 'app-signature-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-overlay" (click)="close()">
      <div class="modal-container" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3 class="modal-title">
            <span class="title-icon">✍️</span>
            Ký số văn bản
          </h3>
          <button class="close-button" (click)="close()">
            <span class="close-icon">✕</span>
          </button>
        </div>

        <div class="modal-content">
          <!-- Document Info -->
          <div class="document-info">
            <h4>Thông tin văn bản</h4>
            <div class="info-row">
              <span class="label">Tiêu đề:</span>
              <span class="value">{{ documentTitle }}</span>
            </div>
            <div class="info-row">
              <span class="label">Số văn bản:</span>
              <span class="value">{{ documentNumber || 'Chưa có' }}</span>
            </div>
            <div class="info-row">
              <span class="label">Ngày tạo:</span>
              <span class="value">{{ documentCreatedAt | date:'dd/MM/yyyy HH:mm' }}</span>
            </div>
          </div>

          <!-- Certificate Selection -->
          <div class="certificate-section">
            <h4>Chọn chứng thư số</h4>
            <div class="certificate-list" *ngIf="certificates.length > 0">
              <div 
                class="certificate-item" 
                *ngFor="let cert of certificates"
                [class.selected]="selectedCertificateId === cert.id"
                (click)="selectCertificate(cert.id)">
                <div class="cert-info">
                  <div class="cert-serial">{{ cert.serialNumber }}</div>
                  <div class="cert-issuer">{{ cert.issuer }}</div>
                  <div class="cert-validity" [class.valid]="cert.isActive" [class.expired]="!cert.isActive">
                    {{ cert.isActive ? 'Còn hiệu lực' : 'Hết hiệu lực' }}
                  </div>
                </div>
                <div class="cert-radio">
                  <input type="radio" [checked]="selectedCertificateId === cert.id">
                </div>
              </div>
            </div>
            <div class="no-certificates" *ngIf="certificates.length === 0">
              <p>Bạn chưa có chứng thư số nào. Vui lòng upload chứng thư số trước.</p>
              <button class="upload-btn" (click)="openCertificateManager()">
                <span class="btn-icon">🔐</span>
                Upload chứng thư số
              </button>
            </div>
          </div>

          <!-- Signature Pad -->
          <div class="signature-section" *ngIf="selectedCertificateId">
            <h4>Chữ ký số</h4>
            <div class="signature-pad-container">
              <canvas #signaturePad class="signature-pad"></canvas>
              <div class="signature-controls">
                <button class="clear-btn" (click)="clearSignature()">
                  <span class="btn-icon">🗑️</span>
                  Xóa chữ ký
                </button>
                <button class="undo-btn" (click)="undoSignature()">
                  <span class="btn-icon">↶</span>
                  Hoàn tác
                </button>
              </div>
            </div>
          </div>

          <!-- Comment -->
          <div class="comment-section">
            <h4>Ghi chú (tùy chọn)</h4>
            <textarea 
              class="comment-input" 
              [(ngModel)]="comment"
              placeholder="Nhập ghi chú cho chữ ký số..."
              rows="3">
            </textarea>
          </div>
        </div>

        <div class="modal-actions">
          <button class="action-btn secondary" (click)="close()">
            <span class="action-icon">❌</span>
            Hủy
          </button>
          <button 
            class="action-btn primary" 
            (click)="signDocument()"
            [disabled]="!canSign()">
            <span class="action-icon">✍️</span>
            Ký số văn bản
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2000;
      animation: fadeIn 0.3s ease;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .modal-container {
      background: var(--color-background-primary);
      border-radius: 12px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      width: 90%;
      max-width: 600px;
      max-height: 90vh;
      overflow-y: auto;
      animation: slideIn 0.3s ease;
    }

    @keyframes slideIn {
      from { 
        opacity: 0; 
        transform: translateY(-20px) scale(0.95); 
      }
      to { 
        opacity: 1; 
        transform: translateY(0) scale(1); 
      }
    }

    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20px 24px;
      border-bottom: 1px solid var(--color-border);
    }

    .modal-title {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--color-text-primary);
    }

    .title-icon {
      font-size: 1.25rem;
    }

    .close-button {
      background: none;
      border: none;
      cursor: pointer;
      padding: 8px;
      border-radius: 6px;
      color: var(--color-text-secondary);
      transition: all 0.2s ease;
    }

    .close-button:hover {
      background: var(--color-background-secondary);
      color: var(--color-text-primary);
    }

    .close-icon {
      font-size: 1.25rem;
      font-weight: 600;
    }

    .modal-content {
      padding: 24px;
    }

    .document-info, .certificate-section, .signature-section, .comment-section {
      margin-bottom: 24px;
    }

    .document-info h4, .certificate-section h4, .signature-section h4, .comment-section h4 {
      margin: 0 0 12px 0;
      font-size: 1rem;
      font-weight: 600;
      color: var(--color-text-primary);
    }

    .info-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      font-size: 0.875rem;
    }

    .label {
      font-weight: 500;
      color: var(--color-text-secondary);
    }

    .value {
      color: var(--color-text-primary);
    }

    .certificate-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .certificate-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px;
      border: 1px solid var(--color-border);
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .certificate-item:hover {
      background: var(--color-background-secondary);
    }

    .certificate-item.selected {
      border-color: var(--color-primary);
      background: color-mix(in srgb, var(--color-primary) 10%, transparent);
    }

    .cert-info {
      flex: 1;
    }

    .cert-serial {
      font-weight: 500;
      color: var(--color-text-primary);
      margin-bottom: 4px;
    }

    .cert-issuer {
      font-size: 0.75rem;
      color: var(--color-text-secondary);
      margin-bottom: 4px;
    }

    .cert-validity {
      font-size: 0.75rem;
      font-weight: 500;
    }

    .cert-validity.valid {
      color: #16a34a;
    }

    .cert-validity.expired {
      color: #dc2626;
    }

    .cert-radio {
      margin-left: 12px;
    }

    .no-certificates {
      text-align: center;
      padding: 24px;
      color: var(--color-text-secondary);
    }

    .upload-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 16px;
      background: var(--color-primary);
      color: white;
      border: none;
      border-radius: 6px;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      margin-top: 12px;
    }

    .upload-btn:hover {
      background: color-mix(in srgb, var(--color-primary) 80%, black);
    }

    .signature-pad-container {
      border: 1px solid var(--color-border);
      border-radius: 6px;
      overflow: hidden;
    }

    .signature-pad {
      width: 100%;
      height: 200px;
      background: white;
      cursor: crosshair;
    }

    .signature-controls {
      display: flex;
      gap: 8px;
      padding: 12px;
      background: var(--color-background-secondary);
    }

    .clear-btn, .undo-btn {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 6px 12px;
      border: 1px solid var(--color-border);
      background: var(--color-background-primary);
      color: var(--color-text-primary);
      border-radius: 4px;
      font-size: 0.75rem;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .clear-btn:hover, .undo-btn:hover {
      background: var(--color-border);
    }

    .comment-input {
      width: 100%;
      padding: 12px;
      border: 1px solid var(--color-border);
      border-radius: 6px;
      font-family: inherit;
      font-size: 0.875rem;
      resize: vertical;
      min-height: 80px;
    }

    .comment-input:focus {
      outline: none;
      border-color: var(--color-primary);
    }

    .modal-actions {
      display: flex;
      gap: 12px;
      padding: 20px 24px;
      border-top: 1px solid var(--color-border);
      justify-content: flex-end;
    }

    .action-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 10px 20px;
      border: none;
      border-radius: 6px;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .action-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .action-btn.secondary {
      background: var(--color-background-secondary);
      color: var(--color-text-primary);
      border: 1px solid var(--color-border);
    }

    .action-btn.secondary:hover:not(:disabled) {
      background: var(--color-border);
    }

    .action-btn.primary {
      background: var(--color-primary);
      color: white;
    }

    .action-btn.primary:hover:not(:disabled) {
      background: color-mix(in srgb, var(--color-primary) 80%, black);
    }

    .action-icon {
      font-size: 1rem;
    }

    @media (max-width: 768px) {
      .modal-container {
        width: 95%;
        margin: 20px;
      }

      .modal-header {
        padding: 16px 20px;
      }

      .modal-content {
        padding: 20px;
      }

      .modal-actions {
        padding: 16px 20px;
        flex-direction: column;
      }

      .action-btn {
        justify-content: center;
      }

      .info-row {
        flex-direction: column;
        gap: 4px;
      }

      .certificate-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
      }

      .cert-radio {
        margin-left: 0;
        align-self: flex-end;
      }
    }
  `]
})
export class SignatureModalComponent implements OnInit {
  @Input() documentId: number = 0;
  @Input() documentTitle: string = '';
  @Input() documentNumber: string = '';
  @Input() documentCreatedAt: Date = new Date();
  @Output() modalClosed = new EventEmitter<void>();
  @Output() signatureCompleted = new EventEmitter<any>();

  @ViewChild('signaturePad', { static: false }) signaturePadRef!: ElementRef<HTMLCanvasElement>;

  certificates: Certificate[] = [];
  selectedCertificateId: number | null = null;
  comment: string = '';
  signaturePad: any;
  isLoading = false;

  constructor(private digitalSignatureService: DigitalSignatureService) {}

  ngOnInit(): void {
    this.loadCertificates();
  }

  ngAfterViewInit(): void {
    this.initSignaturePad();
  }

  private loadCertificates(): void {
    // TODO: Get current user ID from auth service
    const userId = 1; // Mock user ID
    this.digitalSignatureService.getUserCertificates(userId).subscribe({
      next: (certs) => {
        this.certificates = certs;
        if (certs.length > 0) {
          this.selectedCertificateId = certs[0].id;
        }
      },
      error: (error) => {
        console.error('Error loading certificates:', error);
      }
    });
  }

  private initSignaturePad(): void {
    if (this.signaturePadRef && this.signaturePadRef.nativeElement) {
      const canvas = this.signaturePadRef.nativeElement;
      // Use SignaturePad from global window object (CDN)
      this.signaturePad = new (window as any).SignaturePad(canvas, {
        backgroundColor: 'rgb(255, 255, 255)',
        penColor: 'rgb(0, 0, 0)'
      });
    }
  }

  selectCertificate(certificateId: number): void {
    this.selectedCertificateId = certificateId;
  }

  clearSignature(): void {
    if (this.signaturePad) {
      this.signaturePad.clear();
    }
  }

  undoSignature(): void {
    if (this.signaturePad) {
      const data = this.signaturePad.toData();
      if (data.length > 0) {
        data.pop();
        this.signaturePad.fromData(data);
      }
    }
  }

  canSign(): boolean {
    return this.selectedCertificateId !== null && 
           this.signaturePad && 
           !this.signaturePad.isEmpty();
  }

  signDocument(): void {
    if (!this.canSign()) return;

    this.isLoading = true;

    // Get signature data
    const signatureData = this.signaturePad.toDataURL();

    // Create signature input
    const input = {
      documentId: this.documentId,
      certificateId: this.selectedCertificateId!,
      signatureData: signatureData,
      comment: this.comment
    };

    // Call service to create signature
    this.digitalSignatureService.createDigitalSignature(input).subscribe({
      next: (signature) => {
        this.isLoading = false;
        this.signatureCompleted.emit(signature);
        this.close();
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error creating signature:', error);
        alert('Lỗi khi tạo chữ ký số: ' + error.message);
      }
    });
  }

  openCertificateManager(): void {
    // TODO: Implement certificate manager modal
    alert('Tính năng quản lý chứng thư số sẽ được phát triển!');
  }

  close(): void {
    this.modalClosed.emit();
  }
}
