// src/app/shared/interfaces/metadata.interface.ts
export interface Metadata {
  statusCode: number;
  message?: string; // `nullable: true` trong GraphQL tương đương với `?` trong TypeScript
  timestamp: string;
  path?: string;
  // Bạn có thể thêm các trường metadata khác nếu cần
}
