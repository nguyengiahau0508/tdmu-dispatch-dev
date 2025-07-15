import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document } from './entities/document.entity';
import { CreateDocumentInput } from './dto/create-document.input';
import { UpdateDocumentInput } from './dto/update-document.input';
import { GetDocumentsPaginatedInput } from './dto/get-documents-paginated/get-documents-paginated.input';
import { PageDto } from 'src/common/shared/pagination/page.dto';
import { PageMetaDto } from 'src/common/shared/pagination/page-meta.dto';
import { RemoveDocumentOutput } from './dto/remove-document/remove-document.output';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(Document)
    private readonly documentRepository: Repository<Document>
  ) {}

  async create(createDocumentInput: CreateDocumentInput): Promise<Document> {
    const entity = this.documentRepository.create(createDocumentInput);
    return this.documentRepository.save(entity);
  }

  async findPaginated(input: GetDocumentsPaginatedInput): Promise<PageDto<Document>> {
    const { search, page, take, order } = input;
    const queryBuilder = this.documentRepository.createQueryBuilder('document');
    if (search) {
      queryBuilder.where('document.title LIKE :search', { search: `%${search}%` });
    }
    queryBuilder.orderBy('document.id', order);
    queryBuilder.skip(input.skip).take(take);
    const [data, itemCount] = await queryBuilder.getManyAndCount();
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

  async update(id: number, updateDocumentInput: UpdateDocumentInput): Promise<Document> {
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
