export interface IDocumentType {
    id: number;
    name: string;
    description?: string;
}

export interface IDocumentCategory {
    id: number;
    name: string;
    description?: string;
    documentTypeId: number;
    documentType: IDocumentType;
}

export interface IDocument {
    id: number;
    title: string;
    content?: string;
    documentTypeId: number;
    documentType: IDocumentType;
    documentCategoryId: number;
    documentCategory: IDocumentCategory;
    fileId?: number;
    file?: any; // Replace 'any' with the actual file type if available
    status?: string;
    createdAt: Date;
    updatedAt: Date;
}