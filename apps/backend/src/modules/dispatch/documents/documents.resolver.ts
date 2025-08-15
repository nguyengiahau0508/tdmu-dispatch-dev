import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { FileUpload, GraphQLUpload } from 'graphql-upload-ts';
import { DocumentsService } from './documents.service';
import { Document } from './entities/document.entity';
import { CreateDocumentInput } from './dto/create-document.input';
import { UpdateDocumentInput } from './dto/update-document.input';
import { GetDocumentsPaginatedInput } from './dto/get-documents-paginated/get-documents-paginated.input';
import { GetDocumentsPaginatedResponse } from './dto/get-documents-paginated/get-documents-paginated.response';
import { GetDocumentResponse } from './dto/get-document/get-document.response';
import { RemoveDocumentResponse } from './dto/remove-document/remove-document.response';
import { createResponseMetadata } from 'src/common/helpers/metadata.helper';
import { HttpStatus } from '@nestjs/common';

@Resolver(() => Document)
export class DocumentsResolver {
  constructor(private readonly documentsService: DocumentsService) {}

  @Mutation(() => GetDocumentResponse)
  async createDocument(
    @Args('createDocumentInput') createDocumentInput: CreateDocumentInput,
    @Args({ name: 'file', type: () => GraphQLUpload, nullable: true })
    file?: FileUpload,
  ): Promise<GetDocumentResponse> {
    const document = await this.documentsService.create(
      createDocumentInput,
      file,
    );
    return {
      metadata: createResponseMetadata(
        HttpStatus.ACCEPTED,
        'Tạo văn bản thành công',
      ),
      data: { document },
    };
  }

  @Query(() => GetDocumentsPaginatedResponse, { name: 'documents' })
  async findPaginated(
    @Args('input') input: GetDocumentsPaginatedInput,
  ): Promise<GetDocumentsPaginatedResponse> {
    const pageData = await this.documentsService.findPaginated(input);
    return {
      metadata: createResponseMetadata(
        HttpStatus.OK,
        'Lấy danh sách văn bản thành công',
      ),
      data: pageData.data,
      totalCount: pageData.meta.itemCount,
      hasNextPage: pageData.meta.hasNextPage,
    };
  }

  @Query(() => GetDocumentResponse, { name: 'document' })
  async findOne(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<GetDocumentResponse> {
    const document = await this.documentsService.findOne(id);
    return {
      metadata: createResponseMetadata(HttpStatus.OK, 'Lấy văn bản thành công'),
      data: { document },
    };
  }

  @Mutation(() => GetDocumentResponse)
  async updateDocument(
    @Args('updateDocumentInput') updateDocumentInput: UpdateDocumentInput,
  ): Promise<GetDocumentResponse> {
    const document = await this.documentsService.update(
      updateDocumentInput.id,
      updateDocumentInput,
    );
    return {
      metadata: createResponseMetadata(
        HttpStatus.OK,
        'Cập nhật văn bản thành công',
      ),
      data: { document },
    };
  }

  @Mutation(() => RemoveDocumentResponse)
  async removeDocument(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<RemoveDocumentResponse> {
    const result = await this.documentsService.remove(id);
    return {
      metadata: createResponseMetadata(
        HttpStatus.OK,
        result.success
          ? 'Xóa văn bản thành công'
          : 'Không tìm thấy văn bản để xóa',
      ),
      data: result,
    };
  }
}
