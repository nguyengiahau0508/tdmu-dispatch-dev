export interface Document {
  id: number;
  title: string;
  content?: string;
  documentNumber?: string;
  documentType: string;
  documentCategoryId: number;
  fileId?: number;
  status: string;
  priority: string;
  deadline?: Date;
  assignedToUserId?: number;
  createdByUserId: number;
  taskRequestId?: number;
  createdAt: Date;
  updatedAt: Date;
}
