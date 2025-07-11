export interface IFile {
  id: string
  driveFileId: string
  originalName: string
  mimeType: string
  allowedUserIds: number[];
  isPublic: boolean;
}
