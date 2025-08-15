import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DocumentCategory } from './entities/document-category.entity';
import { CreateDocumentCategoryInput } from './dto/create-document-category.input';
import { UpdateDocumentCategoryInput } from './dto/update-document-category.input';
import { GetDocumentCategoriesPaginatedInput } from './dto/get-document-categories-paginated/get-document-categories-paginated.input';
import { PageDto } from 'src/common/shared/pagination/page.dto';
import { PageMetaDto } from 'src/common/shared/pagination/page-meta.dto';
import { RemoveDocumentCategoryOutput } from './dto/remove-document-category/remove-document-category.output';

@Injectable()
export class DocumentCategoryService {
  constructor(
    @InjectRepository(DocumentCategory)
    private readonly documentCategoryRepository: Repository<DocumentCategory>,
  ) {}

  async create(
    createDocumentCategoryInput: CreateDocumentCategoryInput,
  ): Promise<DocumentCategory> {
    const entity = this.documentCategoryRepository.create(
      createDocumentCategoryInput,
    );
    return this.documentCategoryRepository.save(entity);
  }

  async findPaginated(
    input: GetDocumentCategoriesPaginatedInput,
  ): Promise<PageDto<DocumentCategory>> {
    const { search, page, take, order } = input;
    const queryBuilder =
      this.documentCategoryRepository.createQueryBuilder('documentCategory');
    if (search) {
      queryBuilder.where('documentCategory.name LIKE :search', {
        search: `%${search}%`,
      });
    }
    queryBuilder.orderBy('documentCategory.id', order);
    queryBuilder.skip(input.skip).take(take);
    const [data, itemCount] = await queryBuilder.getManyAndCount();
    const meta = new PageMetaDto({ pageOptionsDto: input, itemCount });
    return new PageDto(data, meta);
  }

  async findAll(): Promise<DocumentCategory[]> {
    return this.documentCategoryRepository.find();
  }

  async findOne(id: number): Promise<DocumentCategory> {
    const entity = await this.documentCategoryRepository.findOne({
      where: { id },
    });
    if (!entity) {
      throw new BadRequestException(`DocumentCategory with ID ${id} not found`);
    }
    return entity;
  }

  async update(
    id: number,
    updateDocumentCategoryInput: UpdateDocumentCategoryInput,
  ): Promise<DocumentCategory> {
    const entity = await this.documentCategoryRepository.findOne({
      where: { id },
    });
    if (!entity) {
      throw new BadRequestException(`DocumentCategory with ID ${id} not found`);
    }
    if (updateDocumentCategoryInput.name !== undefined) {
      entity.name = updateDocumentCategoryInput.name;
    }
    if (updateDocumentCategoryInput.description !== undefined) {
      entity.description = updateDocumentCategoryInput.description;
    }
    return this.documentCategoryRepository.save(entity);
  }

  async remove(id: number): Promise<RemoveDocumentCategoryOutput> {
    const result = await this.documentCategoryRepository.delete(id);
    return { success: !!result.affected };
  }
}
