import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { DocumentTypesService } from './document-types.service';
import { DocumentType } from './entities/document-type.entity';
import { CreateDocumentTypeInput } from './dto/create-document-type/create-document-type.input';
import { CreateDocumentTypeResponse } from './dto/create-document-type/create-document-type.response';
import { createResponseMetadata } from 'src/common/helpers/metadata.helper';
import { HttpStatus } from '@nestjs/common';
import { UpdateDocumentTypeInput } from './dto/update-document-type/update-document-type.input';
import { GetDocumentTypesPaginatedInput } from './dto/get-document-types-paginated/get-document-types-paginated.input';
import { GetDocumentTypesPaginatedResponse } from './dto/get-document-types-paginated/get-document-types-paginated.response';
import { GetDocumentTypeResponse } from './dto/get-document-type/get-document-type.response';
import { RemoveDocumentTypeResponse } from './dto/remove-document-type/remove-document-type.response';
import { UpdateDocumentTypeResponse } from './dto/update-document-type/update-document-type.response';

@Resolver(() => DocumentType)
export class DocumentTypesResolver {
  constructor(private readonly documentTypesService: DocumentTypesService) {}

  @Mutation(() => CreateDocumentTypeResponse)
  async createDocumentType(@Args('createDocumentTypeInput') createDocumentTypeInput: CreateDocumentTypeInput): Promise<CreateDocumentTypeResponse> {
    const documentType = await this.documentTypesService.create(createDocumentTypeInput);
    return {
      metadata: createResponseMetadata(HttpStatus.ACCEPTED, "Tạo loại văn bản thành công"),
      data: { documentType },
    };
  }

  @Query(() => GetDocumentTypesPaginatedResponse, { name: 'documentTypes' })
  async findPaginated(@Args('input') input: GetDocumentTypesPaginatedInput): Promise<GetDocumentTypesPaginatedResponse> {
    const pageData = await this.documentTypesService.findPaginated(input);
    return {
      metadata: createResponseMetadata(HttpStatus.OK, "Lấy danh sách loại văn bản thành công"),
      data: pageData.data,
      totalCount: pageData.meta.itemCount,
      hasNextPage: pageData.meta.hasNextPage,
    };
  }

  @Query(() => GetDocumentTypeResponse, { name: 'documentType' })
  async findOne(@Args('id', { type: () => Int }) id: number): Promise<GetDocumentTypeResponse> {
    const documentType = await this.documentTypesService.findOne(id);
    return {
      metadata: createResponseMetadata(HttpStatus.OK, "Lấy loại văn bản thành công"),
      data: { documentType },
    };
  }

  @Mutation(() => UpdateDocumentTypeResponse)
  async updateDocumentType(@Args('updateDocumentTypeInput') updateDocumentTypeInput: UpdateDocumentTypeInput): Promise<UpdateDocumentTypeResponse> {
    const documentType = await this.documentTypesService.update(updateDocumentTypeInput.id, updateDocumentTypeInput);
    return {
      metadata: createResponseMetadata(HttpStatus.OK, "Cập nhật loại văn bản thành công"),
      data: { documentType },
    };
  }

  @Mutation(() => RemoveDocumentTypeResponse)
  async removeDocumentType(@Args('id', { type: () => Int }) id: number): Promise<RemoveDocumentTypeResponse> {
    const result = await this.documentTypesService.remove(id);
    return {
      metadata: createResponseMetadata(HttpStatus.OK, result.success ? "Xóa loại văn bản thành công" : "Không tìm thấy loại văn bản để xóa"),
      data: result,
    };
  }
}
