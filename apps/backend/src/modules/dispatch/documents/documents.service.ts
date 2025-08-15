import { Injectable, BadRequestException } from '@nestjs/common';
import { FilesService } from 'src/modules/files/files.service';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, ILike, Repository } from 'typeorm';
import { Document } from './entities/document.entity';
import { CreateDocumentInput } from './dto/create-document.input';
import { UpdateDocumentInput } from './dto/update-document.input';
import { GetDocumentsPaginatedInput } from './dto/get-documents-paginated/get-documents-paginated.input';
import { PageDto } from 'src/common/shared/pagination/page.dto';
import { PageMetaDto } from 'src/common/shared/pagination/page-meta.dto';
import { RemoveDocumentOutput } from './dto/remove-document/remove-document.output';
import { GoogleDriveService } from 'src/integrations/google-drive/google-drive.service';
import { FileUpload } from 'graphql-upload-ts';
import { DocumentCategoryService } from '../document-category/document-category.service';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(Document)
    private readonly documentRepository: Repository<Document>,
    private readonly googleDriveService: GoogleDriveService,
    private readonly documentCategoryService: DocumentCategoryService,
  ) {}

  async create(
    createDocumentInput: CreateDocumentInput,
    file?: FileUpload,
  ): Promise<Document> {
    let fileEntity: any = undefined;
    
    // Handle file upload
    if (file) {
      // Validate file
      if (!file.filename || !file.mimetype) {
        throw new BadRequestException('Invalid file: missing filename or mimetype');
      }
      
      try {
        const uploadedId = await this.googleDriveService.uploadFile(file);
        
        // Get file info from Google Drive
        const fileInfo = await this.googleDriveService.getFileInfo(uploadedId);
        
        fileEntity = {
          driveFileId: uploadedId,
          originalName: file.filename || fileInfo.name || 'unknown',
          mimeType: file.mimetype || fileInfo.mimeType || 'application/octet-stream',
          isPublic: false,
        };
      } catch (error) {
        console.error('Error uploading file to Google Drive:', error);
        throw new BadRequestException('Failed to upload file to Google Drive');
      }
    }
    // Handle existing file by fileId
    else if (createDocumentInput.fileId) {
      // If fileId is provided, we don't create a new file entity
      // The fileId will be used to link to existing file
      fileEntity = undefined; // Let TypeORM handle the relationship
    }
    
    // Validate documentCategoryId exists
    if (createDocumentInput.documentCategoryId) {
      try {
        await this.documentCategoryService.findOne(createDocumentInput.documentCategoryId);
      } catch (error) {
        throw new BadRequestException(`Document category with ID ${createDocumentInput.documentCategoryId} not found`);
      }
    }
    
    const entity = this.documentRepository.create({
      ...createDocumentInput,
      file: fileEntity,
    });
    
    try {
      const savedDocument = await this.documentRepository.save(entity);
      
      // Load relations for the saved document
      const documentWithRelations = await this.documentRepository.findOne({
        where: { id: savedDocument.id },
        relations: ['documentCategory', 'file']
      });
      
      if (!documentWithRelations) {
        throw new BadRequestException('Failed to load document with relations');
      }
      
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

  async remove(id: number): Promise<RemoveDocumentOutput> {
    const result = await this.documentRepository.delete(id);
    return { success: !!result.affected };
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
}
