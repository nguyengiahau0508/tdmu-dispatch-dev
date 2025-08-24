import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { MockDataService } from './mock-data.service';
import gql from 'graphql-tag';

export interface DigitalSignature {
  id: number;
  documentId: number;
  signedByUserId: number;
  signedByUser: {
    fullName: string;
    email: string;
  };
  signatureData: string;
  certificateId: number;
  certificate: {
    serialNumber: string;
    issuer: string;
    validFrom: Date;
    validTo: Date;
  };
  signatureHash: string;
  signatureTimestamp: Date;
  isValid: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Certificate {
  id: number;
  userId: number;
  user: {
    fullName: string;
    email: string;
  };
  certificateData: string;
  publicKey: string;
  serialNumber: string;
  issuer: string;
  validFrom: Date;
  validTo: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SignatureLog {
  id: number;
  signatureId: number;
  signature: DigitalSignature;
  action: 'SIGN' | 'VERIFY' | 'REVOKE';
  performedByUserId: number;
  performedByUser: {
    fullName: string;
    email: string;
  };
  details: string;
  createdAt: Date;
}

export interface CreateSignatureInput {
  documentId: number;
  certificateId: number;
  signatureData: string;
  comment?: string;
}

export interface VerifySignatureInput {
  signatureId: number;
}

export interface UploadCertificateInput {
  certificateData: string;
  password?: string;
}

@Injectable({
  providedIn: 'root'
})
export class DigitalSignatureService {
  constructor(
    private apollo: Apollo,
    private mockDataService: MockDataService
  ) {}

  // Get document signatures
  getDocumentSignatures(documentId: number): Observable<DigitalSignature[]> {
    // Use mock data for now
    return this.mockDataService.getMockSignatures(documentId);
    
    // TODO: Uncomment when backend is ready
    /*
    return this.apollo.query({
      query: gql`
        query GetDocumentSignatures($documentId: Int!) {
          getDocumentSignatures(documentId: $documentId) {
            id
            documentId
            signedByUserId
            signedByUser {
              fullName
              email
            }
            signatureData
            certificateId
            certificate {
              serialNumber
              issuer
              validFrom
              validTo
            }
            signatureHash
            signatureTimestamp
            isValid
            createdAt
            updatedAt
          }
        }
      `,
      variables: { documentId }
    }).pipe(
      map((result: any) => result.data.getDocumentSignatures)
    );
    */
  }

  // Get signature by ID
  getSignatureById(signatureId: number): Observable<DigitalSignature> {
    return this.apollo.query({
      query: gql`
        query GetSignatureById($signatureId: Int!) {
          getSignatureById(signatureId: $signatureId) {
            id
            documentId
            signedByUserId
            signedByUser {
              fullName
              email
            }
            signatureData
            certificateId
            certificate {
              serialNumber
              issuer
              validFrom
              validTo
            }
            signatureHash
            signatureTimestamp
            isValid
            createdAt
            updatedAt
          }
        }
      `,
      variables: { signatureId }
    }).pipe(
      map((result: any) => result.data.getSignatureById)
    );
  }

  // Get signature history
  getSignatureHistory(documentId: number): Observable<SignatureLog[]> {
    return this.apollo.query({
      query: gql`
        query GetSignatureHistory($documentId: Int!) {
          getSignatureHistory(documentId: $documentId) {
            id
            signatureId
            signature {
              id
              documentId
              signedByUser {
                fullName
                email
              }
              signatureTimestamp
              isValid
            }
            action
            performedByUserId
            performedByUser {
              fullName
              email
            }
            details
            createdAt
          }
        }
      `,
      variables: { documentId }
    }).pipe(
      map((result: any) => result.data.getSignatureHistory)
    );
  }

  // Create digital signature
  createDigitalSignature(input: CreateSignatureInput): Observable<DigitalSignature> {
    // Use mock data for now
    return this.mockDataService.createMockSignature(input);
    
    // TODO: Uncomment when backend is ready
    /*
    return this.apollo.mutate({
      mutation: gql`
        mutation CreateDigitalSignature($input: CreateSignatureInput!) {
          createDigitalSignature(input: $input) {
            id
            documentId
            signedByUserId
            signedByUser {
              fullName
              email
            }
            signatureData
            certificateId
            certificate {
              serialNumber
              issuer
              validFrom
              validTo
            }
            signatureHash
            signatureTimestamp
            isValid
            createdAt
            updatedAt
          }
        }
      `,
      variables: { input }
    }).pipe(
      map((result: any) => result.data.createDigitalSignature)
    );
    */
  }

  // Verify digital signature
  verifyDigitalSignature(input: VerifySignatureInput): Observable<boolean> {
    return this.apollo.mutate({
      mutation: gql`
        mutation VerifyDigitalSignature($input: VerifySignatureInput!) {
          verifyDigitalSignature(input: $input)
        }
      `,
      variables: { input }
    }).pipe(
      map((result: any) => result.data.verifyDigitalSignature)
    );
  }

  // Revoke digital signature
  revokeDigitalSignature(signatureId: number): Observable<boolean> {
    return this.apollo.mutate({
      mutation: gql`
        mutation RevokeDigitalSignature($signatureId: Int!) {
          revokeDigitalSignature(signatureId: $signatureId)
        }
      `,
      variables: { signatureId }
    }).pipe(
      map((result: any) => result.data.revokeDigitalSignature)
    );
  }

  // Get user certificates
  getUserCertificates(userId: number): Observable<Certificate[]> {
    // Use mock data for now
    return this.mockDataService.getMockCertificates();
    
    // TODO: Uncomment when backend is ready
    /*
    return this.apollo.query({
      query: gql`
        query GetUserCertificates($userId: Int!) {
          getUserCertificates(userId: $userId) {
            id
            userId
            user {
              fullName
              email
            }
            certificateData
            publicKey
            serialNumber
            issuer
            validFrom
            validTo
            isActive
            createdAt
            updatedAt
          }
        }
      `,
      variables: { userId }
    }).pipe(
      map((result: any) => result.data.getUserCertificates)
    );
    */
  }

  // Get certificate by ID
  getCertificateById(certificateId: number): Observable<Certificate> {
    return this.apollo.query({
      query: gql`
        query GetCertificateById($certificateId: Int!) {
          getCertificateById(certificateId: $certificateId) {
            id
            userId
            user {
              fullName
              email
            }
            certificateData
            publicKey
            serialNumber
            issuer
            validFrom
            validTo
            isActive
            createdAt
            updatedAt
          }
        }
      `,
      variables: { certificateId }
    }).pipe(
      map((result: any) => result.data.getCertificateById)
    );
  }

  // Upload certificate
  uploadCertificate(input: UploadCertificateInput): Observable<Certificate> {
    return this.apollo.mutate({
      mutation: gql`
        mutation UploadCertificate($input: UploadCertificateInput!) {
          uploadCertificate(input: $input) {
            id
            userId
            user {
              fullName
              email
            }
            certificateData
            publicKey
            serialNumber
            issuer
            validFrom
            validTo
            isActive
            createdAt
            updatedAt
          }
        }
      `,
      variables: { input }
    }).pipe(
      map((result: any) => result.data.uploadCertificate)
    );
  }

  // Revoke certificate
  revokeCertificate(certificateId: number): Observable<boolean> {
    return this.apollo.mutate({
      mutation: gql`
        mutation RevokeCertificate($certificateId: Int!) {
          revokeCertificate(certificateId: $certificateId)
        }
      `,
      variables: { certificateId }
    }).pipe(
      map((result: any) => result.data.revokeCertificate)
    );
  }

  // Validate certificate
  validateCertificate(certificateData: string): Observable<boolean> {
    return this.apollo.query({
      query: gql`
        query ValidateCertificate($certificateData: String!) {
          validateCertificate(certificateData: $certificateData)
        }
      `,
      variables: { certificateData }
    }).pipe(
      map((result: any) => result.data.validateCertificate)
    );
  }

  // Check if user has valid signature for document
  hasValidSignature(documentId: number, userId: number): Observable<boolean> {
    return this.apollo.query({
      query: gql`
        query HasValidSignature($documentId: Int!, $userId: Int!) {
          hasValidSignature(documentId: $documentId, userId: $userId)
        }
      `,
      variables: { documentId, userId }
    }).pipe(
      map((result: any) => result.data.hasValidSignature)
    );
  }
}
