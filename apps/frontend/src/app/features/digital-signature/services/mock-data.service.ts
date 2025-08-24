import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Certificate, DigitalSignature } from './digital-signature.service';

@Injectable({
  providedIn: 'root'
})
export class MockDataService {

  constructor() { }

  getMockCertificates(): Observable<Certificate[]> {
    const mockCertificates: Certificate[] = [
      {
        id: 1,
        userId: 1,
        certificateData: 'mock-certificate-data-1',
        publicKey: 'mock-public-key-1',
        serialNumber: 'TDMU-CERT-001',
        issuer: 'TDMU Certificate Authority',
        validFrom: new Date('2024-01-01'),
        validTo: new Date('2025-12-31'),
        isActive: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        user: {
          id: 1,
          fullName: 'Nguyễn Văn A',
          email: 'nguyenvana@tdmu.edu.vn'
        } as any,
        signatures: [] as any
      } as any,
      {
        id: 2,
        userId: 1,
        certificateData: 'mock-certificate-data-2',
        publicKey: 'mock-public-key-2',
        serialNumber: 'TDMU-CERT-002',
        issuer: 'Viettel CA',
        validFrom: new Date('2024-06-01'),
        validTo: new Date('2025-05-31'),
        isActive: true,
        createdAt: new Date('2024-06-01'),
        updatedAt: new Date('2024-06-01'),
        user: {
          id: 1,
          fullName: 'Nguyễn Văn A',
          email: 'nguyenvana@tdmu.edu.vn'
        } as any,
        signatures: [] as any
      } as any
    ];

    return of(mockCertificates);
  }

  getMockSignatures(documentId: number): Observable<DigitalSignature[]> {
    const mockSignatures: DigitalSignature[] = [
      {
        id: 1,
        documentId: documentId,
        signedByUserId: 1,
        signatureData: 'mock-signature-data-1',
        certificateId: 1,
        signatureHash: 'mock-hash-1',
        signatureTimestamp: new Date('2024-08-20T10:30:00'),
        isValid: true,
        createdAt: new Date('2024-08-20T10:30:00'),
        updatedAt: new Date('2024-08-20T10:30:00'),
        document: null as any,
        signedByUser: {
          id: 1,
          fullName: 'Nguyễn Văn A',
          email: 'nguyenvana@tdmu.edu.vn'
        } as any,
        certificate: {
          id: 1,
          serialNumber: 'TDMU-CERT-001',
          issuer: 'TDMU Certificate Authority'
        } as any,
        logs: []
      } as any
    ];

    return of(mockSignatures);
  }

  createMockSignature(input: any): Observable<DigitalSignature> {
    const mockSignature: DigitalSignature = {
      id: Math.floor(Math.random() * 1000) + 1,
      documentId: input.documentId,
      signedByUserId: 1,
      signatureData: input.signatureData,
      certificateId: input.certificateId,
      signatureHash: 'mock-hash-' + Date.now(),
      signatureTimestamp: new Date(),
      isValid: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      document: null as any,
      signedByUser: {
        id: 1,
        fullName: 'Nguyễn Văn A',
        email: 'nguyenvana@tdmu.edu.vn'
      } as any,
      certificate: {
        id: input.certificateId,
        serialNumber: 'TDMU-CERT-001',
        issuer: 'TDMU Certificate Authority'
      } as any,
      logs: []
    } as any;

    return of(mockSignature);
  }
}
