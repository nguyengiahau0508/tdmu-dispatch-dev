import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { FilesService } from 'src/modules/files/files.service';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, ILike, Repository } from 'typeorm';
import { Document, DocumentTypeEnum } from './entities/document.entity';
import { CreateDocumentInput } from './dto/create-document.input';
import { UpdateDocumentInput } from './dto/update-document.input';
import { GetDocumentsPaginatedInput } from './dto/get-documents-paginated/get-documents-paginated.input';
import { PageDto } from 'src/common/shared/pagination/page.dto';
import { PageMetaDto } from 'src/common/shared/pagination/page-meta.dto';
import { RemoveDocumentOutput } from './dto/remove-document/remove-document.output';
import { GoogleDriveService } from 'src/integrations/google-drive/google-drive.service';
import { FileUpload } from 'graphql-upload-ts';
import { DocumentCategoryService } from '../document-category/document-category.service';
import { WorkflowInstancesService } from 'src/modules/workflow/workflow-instances/workflow-instances.service';
import { User } from 'src/modules/users/entities/user.entity';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(Document)
    private readonly documentRepository: Repository<Document>,
    private readonly googleDriveService: GoogleDriveService,
    private readonly documentCategoryService: DocumentCategoryService,
    private readonly workflowInstancesService: WorkflowInstancesService,
  ) {}

  async create(
    createDocumentInput: CreateDocumentInput,
    file?: FileUpload,
    user?: User,
  ): Promise<Document> {
    console.log('=== CREATE DOCUMENT START ===');
    console.log('Creating document with input:', createDocumentInput);
    console.log('User:', user?.id, user?.email);
    
    let fileEntity: any = undefined;
    
    // Validate required fields
    if (!createDocumentInput.title?.trim()) {
      throw new BadRequestException('Document title is required');
    }
    
    if (!createDocumentInput.documentType) {
      throw new BadRequestException('Document type is required');
    }
    
    if (!createDocumentInput.documentCategoryId) {
      throw new BadRequestException('Document category is required');
    }
    
    // Handle file upload
    if (file) {
      console.log('Processing file upload...');
      
      // Validate file
      if (!file.filename || !file.mimetype) {
        throw new BadRequestException('Invalid file: missing filename or mimetype');
      }
      
      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.createReadStream && file.createReadStream().readableLength > maxSize) {
        throw new BadRequestException('File size exceeds 10MB limit');
      }
      
      try {
        const uploadedId = await this.googleDriveService.uploadFile(file);
        console.log('File uploaded to Google Drive:', uploadedId);
        
        // Get file info from Google Drive
        const fileInfo = await this.googleDriveService.getFileInfo(uploadedId);
        
        fileEntity = {
          driveFileId: uploadedId,
          originalName: file.filename || fileInfo.name || 'unknown',
          mimeType: file.mimetype || fileInfo.mimeType || 'application/octet-stream',
          isPublic: false,
        };
        
        console.log('File entity created:', fileEntity);
      } catch (error) {
        console.error('Error uploading file to Google Drive:', error);
        throw new BadRequestException('Failed to upload file to Google Drive');
      }
    }
    // Handle existing file by fileId
    else if (createDocumentInput.fileId) {
      console.log('Using existing file ID:', createDocumentInput.fileId);
      // If fileId is provided, we don't create a new file entity
      // The fileId will be used to link to existing file
      fileEntity = undefined; // Let TypeORM handle the relationship
    }
    
    // Validate documentCategoryId exists
    if (createDocumentInput.documentCategoryId) {
      console.log('Validating document category...');
      try {
        await this.documentCategoryService.findOne(createDocumentInput.documentCategoryId);
        console.log('Document category validated');
      } catch (error) {
        throw new BadRequestException(`Document category with ID ${createDocumentInput.documentCategoryId} not found`);
      }
    }
    
    // Create document entity
    const entity = this.documentRepository.create({
      ...createDocumentInput,
      file: fileEntity,
      status: createDocumentInput.status || 'draft',
    });
    
    console.log('Document entity created:', {
      id: entity.id,
      title: entity.title,
      documentType: entity.documentType,
      documentCategoryId: entity.documentCategoryId,
      status: entity.status
    });
    
    try {
      const savedDocument = await this.documentRepository.save(entity);
      console.log('Document saved successfully:', savedDocument.id);
      
      // Load relations for the saved document
      const documentWithRelations = await this.documentRepository.findOne({
        where: { id: savedDocument.id },
        relations: ['documentCategory', 'file']
      });
      
      if (!documentWithRelations) {
        throw new BadRequestException('Failed to load document with relations');
      }
      
      console.log('Document with relations loaded:', {
        id: documentWithRelations.id,
        title: documentWithRelations.title,
        category: documentWithRelations.documentCategory?.name,
        hasFile: !!documentWithRelations.file
      });
      
      // Auto-create workflow if document type requires it
      if (this.shouldCreateWorkflow(documentWithRelations)) {
        console.log('Auto-creating workflow for document...');
        try {
          await this.createWorkflowForDocument(documentWithRelations, user);
          console.log('Workflow created successfully');
        } catch (workflowError) {
          console.error('Error creating workflow:', workflowError);
          // Don't fail document creation if workflow creation fails
        }
      }
      
      console.log('=== CREATE DOCUMENT COMPLETE ===');
      return documentWithRelations;
    } catch (error) {
      console.error('Error saving document:', error);
      throw new BadRequestException('Failed to save document');
    }
  }

  async findPaginated(
    input: GetDocumentsPaginatedInput,
  ): Promise<PageDto<Document>> {
    const { search, documentType, page, take, order, skip } = input;

    // Xây dựng điều kiện WHERE
    const where: FindOptionsWhere<Document>[] = [];

    if (search) {
      // Nếu có search, dùng ILike (PostgreSQL) hoặc Like (MySQL)
      where.push({ title: ILike(`%${search}%`) });
    }

    if (documentType) {
      where.push({ documentType });
    }

    const [data, itemCount] = await this.documentRepository.findAndCount({
      where: where.length > 0 ? where : undefined,
      relations: ['documentCategory', 'file'],
      order: { id: order },
      skip: skip,
      take: take,
    });

    const meta = new PageMetaDto({ pageOptionsDto: input, itemCount });
    return new PageDto(data, meta);
  }

  async findOne(id: number): Promise<Document> {
    const entity = await this.documentRepository.findOne({ 
      where: { id },
      relations: ['documentCategory', 'file']
    });
    if (!entity) {
      throw new BadRequestException(`Document with ID ${id} not found`);
    }
    return entity;
  }

  async update(
    id: number,
    updateDocumentInput: UpdateDocumentInput,
  ): Promise<Document> {
    const entity = await this.documentRepository.findOne({ where: { id } });
    if (!entity) {
      throw new BadRequestException(`Document with ID ${id} not found`);
    }
    
    // Validate documentCategoryId exists if provided
    if (updateDocumentInput.documentCategoryId) {
      try {
        await this.documentCategoryService.findOne(updateDocumentInput.documentCategoryId);
      } catch (error) {
        throw new BadRequestException(`Document category with ID ${updateDocumentInput.documentCategoryId} not found`);
      }
    }
    if (updateDocumentInput.title !== undefined) {
      entity.title = updateDocumentInput.title;
    }
    if (updateDocumentInput.content !== undefined) {
      entity.content = updateDocumentInput.content;
    }
    if (updateDocumentInput.documentType !== undefined) {
      entity.documentType = updateDocumentInput.documentType;
    }
    if (updateDocumentInput.documentCategoryId !== undefined) {
      entity.documentCategoryId = updateDocumentInput.documentCategoryId;
    }
    if (updateDocumentInput.fileId !== undefined) {
      entity.fileId = updateDocumentInput.fileId;
    }
    if (updateDocumentInput.status !== undefined) {
      entity.status = updateDocumentInput.status;
    }
    
    const savedDocument = await this.documentRepository.save(entity);
    
    // Load relations for the updated document
    const documentWithRelations = await this.documentRepository.findOne({
      where: { id: savedDocument.id },
      relations: ['documentCategory', 'file']
    });
    
    if (!documentWithRelations) {
      throw new BadRequestException('Failed to load document with relations');
    }
    
    return documentWithRelations;
  }

  async remove(id: number): Promise<boolean> {
    const result = await this.documentRepository.delete(id);
    return !!result.affected;
  }

  // Debug method to test file upload
  async testFileUpload(file: FileUpload): Promise<string> {
    try {
      const uploadedId = await this.googleDriveService.uploadFile(file);
      console.log('File uploaded successfully:', uploadedId);
      return uploadedId;
    } catch (error) {
      console.error('File upload test failed:', error);
      throw error;
    }
  }

  private shouldCreateWorkflow(document: Document): boolean {
    // Auto-create workflow for OUTGOING documents
    return document.documentType === DocumentTypeEnum.OUTGOING && document.status === 'pending';
  }

  private async createWorkflowForDocument(document: Document, user?: User): Promise<void> {
    if (!user) {
      console.log('No user provided, skipping workflow creation');
      return;
    }

    // Get default workflow template for document type
    const defaultTemplateId = await this.getDefaultWorkflowTemplate(document.documentType);
    
    if (!defaultTemplateId) {
      console.log('No default workflow template found for document type:', document.documentType);
      return;
    }

    const workflowInput = {
      templateId: defaultTemplateId,
      documentId: document.id,
      notes: `Auto-created workflow for document: ${document.title}`,
    };

    await this.workflowInstancesService.create(workflowInput, user);
  }

  private async getDefaultWorkflowTemplate(documentType: DocumentTypeEnum): Promise<number | null> {
    // This should be implemented based on your business logic
    // For now, return a default template ID
    const templateMap = {
      [DocumentTypeEnum.OUTGOING]: 1, // Default template for outgoing documents
      [DocumentTypeEnum.INCOMING]: 2, // Default template for incoming documents
      [DocumentTypeEnum.INTERNAL]: 3, // Default template for internal documents
    };
    
    return templateMap[documentType] || null;
  }
}
