import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { DocumentCategoryService } from './document-category.service';
import { DocumentCategory } from './entities/document-category.entity';
import { CreateDocumentCategoryInput } from './dto/create-document-category.input';
import { UpdateDocumentCategoryInput } from './dto/update-document-category.input';
import { GetDocumentCategoriesPaginatedInput } from './dto/get-document-categories-paginated/get-document-categories-paginated.input';
import { GetDocumentCategoriesPaginatedResponse } from './dto/get-document-categories-paginated/get-document-categories-paginated.response';
import { GetDocumentCategoryResponse } from './dto/get-document-category/get-document-category.response';
import { RemoveDocumentCategoryResponse } from './dto/remove-document-category/remove-document-category.response';
import { createResponseMetadata } from 'src/common/helpers/metadata.helper';
import { HttpStatus } from '@nestjs/common';

@Resolver(() => DocumentCategory)
export class DocumentCategoryResolver {
  constructor(private readonly documentCategoryService: DocumentCategoryService) {}

  @Mutation(() => GetDocumentCategoryResponse)
  async createDocumentCategory(@Args('createDocumentCategoryInput') createDocumentCategoryInput: CreateDocumentCategoryInput): Promise<GetDocumentCategoryResponse> {
    const documentCategory = await this.documentCategoryService.create(createDocumentCategoryInput);
    return {
      metadata: createResponseMetadata(HttpStatus.ACCEPTED, "Tạo nhóm văn bản thành công"),
      data: { documentCategory },
    };
  }

  @Query(() => GetDocumentCategoriesPaginatedResponse, { name: 'documentCategories' })
  async findPaginated(@Args('input') input: GetDocumentCategoriesPaginatedInput): Promise<GetDocumentCategoriesPaginatedResponse> {
    const pageData = await this.documentCategoryService.findPaginated(input);
    return {
      metadata: createResponseMetadata(HttpStatus.OK, "Lấy danh sách nhóm văn bản thành công"),
      data: pageData.data,
      totalCount: pageData.meta.itemCount,
      hasNextPage: pageData.meta.hasNextPage,
    };
  }

  @Query(() => GetDocumentCategoryResponse, { name: 'documentCategory' })
  async findOne(@Args('id', { type: () => Int }) id: number): Promise<GetDocumentCategoryResponse> {
    const documentCategory = await this.documentCategoryService.findOne(id);
    return {
      metadata: createResponseMetadata(HttpStatus.OK, "Lấy nhóm văn bản thành công"),
      data: { documentCategory },
    };
  }

  @Query(() => [DocumentCategory], { name: 'allDocumentCategories' })
  async findAll(): Promise<DocumentCategory[]> {
    return this.documentCategoryService.findAll();
  }

  @Mutation(() => GetDocumentCategoryResponse)
  async updateDocumentCategory(@Args('updateDocumentCategoryInput') updateDocumentCategoryInput: UpdateDocumentCategoryInput): Promise<GetDocumentCategoryResponse> {
    const documentCategory = await this.documentCategoryService.update(updateDocumentCategoryInput.id, updateDocumentCategoryInput);
    return {
      metadata: createResponseMetadata(HttpStatus.OK, "Cập nhật nhóm văn bản thành công"),
      data: { documentCategory },
    };
  }

  @Mutation(() => RemoveDocumentCategoryResponse)
  async removeDocumentCategory(@Args('id', { type: () => Int }) id: number): Promise<RemoveDocumentCategoryResponse> {
    const result = await this.documentCategoryService.remove(id);
    return {
      metadata: createResponseMetadata(HttpStatus.OK, result.success ? "Xóa nhóm văn bản thành công" : "Không tìm thấy nhóm văn bản để xóa"),
      data: result,
    };
  }
}
