import { BadRequestException, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { DocumentType } from './entities/document-type.entity';
import { CreateDocumentTypeInput } from './dto/create-document-type/create-document-type.input';
import { UpdateDocumentTypeInput } from './dto/update-document-type/update-document-type.input';
import { GetDocumentTypesPaginatedInput } from './dto/get-document-types-paginated/get-document-types-paginated.input';
import { PageDto } from 'src/common/shared/pagination/page.dto';
import { RemoveDocumentTypeOutput } from './dto/remove-document-type/remove-document-type.output';
import { PageMetaDto } from 'src/common/shared/pagination/page-meta.dto';
@Injectable()
export class DocumentTypesService {
  constructor(
    @InjectRepository(DocumentType) private readonly documentTypesRepository: Repository<DocumentType>
  ) {}

  create(createDocumentTypeInput:CreateDocumentTypeInput ) {
    const documentType = this.documentTypesRepository.create(createDocumentTypeInput);
    return this.documentTypesRepository.save(documentType);
  }

  findAll() {
    return `This action returns all documentTypes`;
  }

  async findPaginated(input: GetDocumentTypesPaginatedInput): Promise<PageDto<DocumentType>> {
    const { search, page, take, order } = input;
    const queryBuilder = this.documentTypesRepository.createQueryBuilder('documentType');
    if (search) {
      queryBuilder.where('documentType.name LIKE :search', { search: `%${search}%` });
    }
    queryBuilder.orderBy('documentType.id', order);
    queryBuilder.skip(input.skip).take(take);
    const [data, itemCount] = await queryBuilder.getManyAndCount();
    const meta = new PageMetaDto({ pageOptionsDto: input, itemCount });
    return new PageDto(data, meta);
  }

  async findOne(id: number): Promise<DocumentType> {
    const documentType = await this.documentTypesRepository.findOne({ where: { id } });
    if (!documentType) {
      throw new BadRequestException(`DocumentType with ID ${id} not found`);
    }
    return documentType;
  }

 async update(id: number, updateDocumentTypeInput: UpdateDocumentTypeInput) {
    const documentType = await this.documentTypesRepository.findOne({ where: { id } });
    if (!documentType) {
      throw new BadRequestException(`DocumentType with ID ${id} not found`);
    }

    if (updateDocumentTypeInput.name !== undefined) {
      documentType.name = updateDocumentTypeInput.name;
    }

    if (updateDocumentTypeInput.description !== undefined) {
      documentType.description = updateDocumentTypeInput.description;
    }

    const updatedDocumentType = await this.documentTypesRepository.save(documentType);
    if (!updatedDocumentType) {
      throw new BadRequestException('Failed to update DocumentType');
    }

    return updatedDocumentType;
  }

  async remove(id: number): Promise<RemoveDocumentTypeOutput> {
    const result = await this.documentTypesRepository.delete(id);
    return { success: !!result.affected };
  }
}
