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

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(Document)
    private readonly documentRepository: Repository<Document>,
    private readonly googleDriveService: GoogleDriveService,
  ) {}

  async create(
    createDocumentInput: CreateDocumentInput,
    file?: FileUpload,
  ): Promise<Document> {
    let driveFileId: string | undefined = undefined;
    if (file) {
      const uploadedId = await this.googleDriveService.uploadFile(file);
      driveFileId = uploadedId;
    }
    const entity = this.documentRepository.create({
      ...createDocumentInput,
      file: driveFileId
        ? {
            driveFileId: driveFileId,
            isPublic: false,
          }
        : undefined,
    });
    return this.documentRepository.save(entity);
  }

  async findPaginated(
    input: GetDocumentsPaginatedInput,
  ): Promise<PageDto<Document>> {
    const { search, page, take, order, skip } = input;

    // Xây dựng điều kiện WHERE
    const where: FindOptionsWhere<Document>[] = [];

    if (search) {
      // Nếu có search, dùng ILike (PostgreSQL) hoặc Like (MySQL)
      where.push({ title: ILike(`%${search}%`) });
    }

    const [data, itemCount] = await this.documentRepository.findAndCount({
      where: where.length > 0 ? where : undefined,
      order: { id: order },
      skip: skip,
      take: take,
    });

    const meta = new PageMetaDto({ pageOptionsDto: input, itemCount });
    return new PageDto(data, meta);
  }

  async findOne(id: number): Promise<Document> {
    const entity = await this.documentRepository.findOne({ where: { id } });
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
    return this.documentRepository.save(entity);
  }

  async remove(id: number): Promise<RemoveDocumentOutput> {
    const result = await this.documentRepository.delete(id);
    return { success: !!result.affected };
  }
}
