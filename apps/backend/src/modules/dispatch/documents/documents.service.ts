import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { FilesService } from 'src/modules/files/files.service';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, ILike, Repository, DataSource } from 'typeorm';
import { Document, DocumentTypeEnum, DocumentStatus, DocumentPriority } from './entities/document.entity';
import { CreateDocumentInput } from './dto/create-document/create-document.input';
import { UpdateDocumentInput } from './dto/update-document/update-document.input';
import { GetDocumentsPaginatedInput } from './dto/get-documents-paginated/get-documents-paginated.input';
import { PageDto } from 'src/common/shared/pagination/page.dto';
import { PageMetaDto } from 'src/common/shared/pagination/page-meta.dto';
import { RemoveDocumentOutput } from './dto/remove-document/remove-document.output';
import { GoogleDriveService } from 'src/integrations/google-drive/google-drive.service';
import { FileUpload } from 'graphql-upload-ts';
import { DocumentCategoryService } from '../document-category/document-category.service';
import { WorkflowInstancesService } from 'src/modules/workflow/workflow-instances/workflow-instances.service';
import { User } from 'src/modules/users/entities/user.entity';
import { File } from 'src/modules/files/entities/file.entity';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(Document)
    private readonly documentRepository: Repository<Document>,
    @InjectRepository(File)
    private readonly fileRepository: Repository<File>,
    private readonly dataSource: DataSource,
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
        
        // Create and save file entity to database
        const fileEntityData = {
          driveFileId: uploadedId,
          originalName: file.filename || fileInfo.name || 'unknown',
          mimeType: file.mimetype || fileInfo.mimeType || 'application/octet-stream',
          isPublic: false,
        };
        
        try {
          const fileEntityToSave = this.fileRepository.create(fileEntityData);
          const savedFileEntity = await this.fileRepository.save(fileEntityToSave);
          console.log('File entity saved to database:', savedFileEntity);
          
          fileEntity = savedFileEntity;
        } catch (fileSaveError) {
          console.error('Error saving file entity to database:', fileSaveError);
          // Try to delete the uploaded file from Google Drive if database save fails
          try {
            await this.googleDriveService.deleteFile(uploadedId);
            console.log('Deleted file from Google Drive due to database save failure');
          } catch (deleteError) {
            console.error('Failed to delete file from Google Drive:', deleteError);
          }
          throw new BadRequestException('Failed to save file information to database');
        }
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
    const entityData: Partial<Document> = {
      title: createDocumentInput.title,
      content: createDocumentInput.content,
      documentNumber: createDocumentInput.documentNumber,
      documentType: createDocumentInput.documentType,
      documentCategoryId: createDocumentInput.documentCategoryId,
      status: createDocumentInput.status || DocumentStatus.DRAFT,
      priority: createDocumentInput.priority,
      deadline: createDocumentInput.deadline ? new Date(createDocumentInput.deadline) : undefined,
      assignedToUserId: createDocumentInput.assignedToUserId,
      createdByUserId: user?.id,
    };
    
    // Set fileId if we have a file entity or if fileId is provided in input
    if (fileEntity) {
      entityData.fileId = fileEntity.id;
      console.log('File ID set for document:', fileEntity.id);
    } else if (createDocumentInput.fileId) {
      entityData.fileId = createDocumentInput.fileId;
      console.log('Using existing file ID:', createDocumentInput.fileId);
    }
    
    const entity = this.documentRepository.create(entityData);
    
    console.log('Document entity created:', {
      id: entity.id,
      title: entity.title,
      documentType: entity.documentType,
      documentCategoryId: entity.documentCategoryId,
      fileId: entity.fileId,
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
        fileId: documentWithRelations.fileId,
        hasFile: !!documentWithRelations.file,
        fileDriveId: documentWithRelations.file?.driveFileId
      });
      
      // Auto-create workflow if document type requires it
      if (this.shouldCreateWorkflow(documentWithRelations, createDocumentInput.workflowTemplateId)) {
        console.log('Auto-creating workflow for document...');
        try {
          await this.createWorkflowForDocument(documentWithRelations, user, createDocumentInput.workflowTemplateId);
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
    const { search, documentType } = input;

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
      order: { id: input.order },
      skip: input.skip,
      take: input.take,
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
    console.log('=== DocumentsService.update ===');
    console.log('ID to update:', id);
    console.log('Update input:', updateDocumentInput);
    
    const entity = await this.documentRepository.findOne({ where: { id } });
    console.log('Found entity:', entity);
    
    if (!entity) {
      console.log('❌ Document not found with ID:', id);
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
      entity.status = updateDocumentInput.status as DocumentStatus;
    }
    
    console.log('Saving updated entity...');
    const savedDocument = await this.documentRepository.save(entity);
    console.log('Saved document:', savedDocument);
    
    // Load relations for the updated document
    console.log('Loading document with relations...');
    const documentWithRelations = await this.documentRepository.findOne({
      where: { id: savedDocument.id },
      relations: ['documentCategory', 'file']
    });
    
    console.log('Document with relations:', documentWithRelations);
    
    if (!documentWithRelations) {
      console.log('❌ Failed to load document with relations');
      throw new BadRequestException('Failed to load document with relations');
    }
    
    console.log('✅ Returning updated document:', documentWithRelations);
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

  private shouldCreateWorkflow(document: Document, workflowTemplateId?: number): boolean {
    // Logic mới: Tạo workflow cho tất cả văn bản cần xử lý
    // 1. User chỉ định template cụ thể
    if (workflowTemplateId) {
      return true;
    }
    
    // 2. Văn bản đi (OUTGOING) - luôn cần workflow phê duyệt
    if (document.documentType === DocumentTypeEnum.OUTGOING) {
      return true;
    }
    
    // 3. Văn bản đến (INCOMING) - cần workflow xử lý
    if (document.documentType === DocumentTypeEnum.INCOMING) {
      return true;
    }
    
    // 4. Văn bản nội bộ (INTERNAL) - chỉ cần workflow nếu có yêu cầu đặc biệt
    if (document.documentType === DocumentTypeEnum.INTERNAL && document.priority === DocumentPriority.HIGH) {
      return true;
    }
    
    return false;
  }

  private async createWorkflowForDocument(document: Document, user?: User, workflowTemplateId?: number): Promise<void> {
    if (!user) {
      console.log('No user provided, skipping workflow creation');
      return;
    }

    let templateId: number;

    if (workflowTemplateId) {
      // Use user-specified template
      templateId = workflowTemplateId;
      console.log('Using user-specified workflow template:', templateId);
    } else {
      // Get default workflow template for document type
      const defaultTemplateId = await this.getDefaultWorkflowTemplate(document.documentType, document.priority);
      
      if (!defaultTemplateId) {
        console.log('No default workflow template found for document type:', document.documentType);
        return;
      }
      templateId = defaultTemplateId;
      console.log('Using default workflow template:', templateId);
    }

    const workflowInput = {
      templateId: templateId,
      documentId: document.id,
      notes: `Auto-created workflow for ${document.documentType} document: ${document.title}`,
    };

    try {
      const workflowInstance = await this.workflowInstancesService.create(workflowInput, user);
      console.log('Workflow created successfully for document:', document.id);
      
      // Cập nhật workflowInstanceId của document
      document.workflowInstanceId = workflowInstance.id;
      await this.documentRepository.save(document);
      console.log('Document workflowInstanceId updated:', workflowInstance.id);
    } catch (error) {
      console.error('Failed to create workflow for document:', document.id, error);
      // Don't fail document creation if workflow creation fails
    }
  }

  private async getDefaultWorkflowTemplate(documentType: DocumentTypeEnum, priority?: DocumentPriority): Promise<number | null> {
    // Logic mới: Template dựa trên loại văn bản và độ ưu tiên
    const templateMap = {
      [DocumentTypeEnum.OUTGOING]: {
        [DocumentPriority.LOW]: 1,      // Quy trình phê duyệt văn bản thông thường
        [DocumentPriority.MEDIUM]: 1,   // Quy trình phê duyệt văn bản thông thường
        [DocumentPriority.HIGH]: 2,     // Quy trình phê duyệt văn bản tài chính (nhanh hơn)
        [DocumentPriority.URGENT]: 2,   // Quy trình phê duyệt văn bản tài chính (nhanh hơn)
      },
      [DocumentTypeEnum.INCOMING]: {
        [DocumentPriority.LOW]: 3,      // Quy trình xử lý văn bản đến
        [DocumentPriority.MEDIUM]: 3,   // Quy trình xử lý văn bản đến
        [DocumentPriority.HIGH]: 4,     // Quy trình xử lý văn bản đến khẩn cấp
        [DocumentPriority.URGENT]: 4,   // Quy trình xử lý văn bản đến khẩn cấp
      },
      [DocumentTypeEnum.INTERNAL]: {
        [DocumentPriority.LOW]: 5,      // Quy trình nội bộ đơn giản
        [DocumentPriority.MEDIUM]: 5,   // Quy trình nội bộ đơn giản
        [DocumentPriority.HIGH]: 6,     // Quy trình nội bộ phức tạp
        [DocumentPriority.URGENT]: 6,   // Quy trình nội bộ phức tạp
      },
    };
    
    const priorityKey = priority || DocumentPriority.MEDIUM;
    return templateMap[documentType]?.[priorityKey] || null;
  }

  /**
   * Cập nhật trạng thái văn bản dựa trên trạng thái workflow
   */
  async updateDocumentStatusFromWorkflow(documentId: number, workflowStatus: string): Promise<void> {
    const document = await this.findOne(documentId);
    if (!document) {
      throw new BadRequestException(`Document with ID ${documentId} not found`);
    }

    let newStatus: DocumentStatus;
    
    switch (workflowStatus) {
      case 'IN_PROGRESS':
        newStatus = DocumentStatus.PROCESSING;
        break;
      case 'COMPLETED':
        newStatus = DocumentStatus.APPROVED;
        break;
      case 'REJECTED':
        newStatus = DocumentStatus.REJECTED;
        break;
      case 'CANCELLED':
        newStatus = DocumentStatus.CANCELLED;
        break;
      default:
        newStatus = DocumentStatus.PROCESSING;
    }

    if (document.status !== newStatus) {
      document.status = newStatus;
      await this.documentRepository.save(document);
      console.log(`Document ${documentId} status updated from ${document.status} to ${newStatus}`);
    }
  }

  /**
   * Lấy danh sách văn bản theo trạng thái xử lý
   */
  async getDocumentsByProcessingStatus(userId: number, status: 'pending' | 'processing' | 'completed' | 'rejected'): Promise<Document[]> {
    const query = this.documentRepository.createQueryBuilder('document')
      .leftJoinAndSelect('document.documentCategory', 'category')
      .leftJoinAndSelect('document.file', 'file')
      .leftJoinAndSelect('document.createdByUser', 'creator');

    switch (status) {
      case 'pending':
        // Văn bản chờ xử lý: DRAFT hoặc PENDING
        query.where('document.status IN (:...statuses)', { 
          statuses: [DocumentStatus.DRAFT, DocumentStatus.PENDING] 
        });
        break;
      case 'processing':
        // Văn bản đang xử lý: PROCESSING
        query.where('document.status = :status', { status: DocumentStatus.PROCESSING });
        break;
      case 'completed':
        // Văn bản hoàn thành: APPROVED hoặc COMPLETED
        query.where('document.status IN (:...statuses)', { 
          statuses: [DocumentStatus.APPROVED, DocumentStatus.COMPLETED] 
        });
        break;
      case 'rejected':
        // Văn bản bị từ chối: REJECTED hoặc CANCELLED
        query.where('document.status IN (:...statuses)', { 
          statuses: [DocumentStatus.REJECTED, DocumentStatus.CANCELLED] 
        });
        break;
    }

    // Chỉ lấy văn bản của user hoặc văn bản được giao cho user
    query.andWhere('(document.createdByUserId = :userId OR document.assignedToUserId = :userId)', { userId });

    return query.orderBy('document.createdAt', 'DESC').getMany();
  }
}
