import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { FileUpload, GraphQLUpload } from 'graphql-upload-ts';
import { DocumentsService } from './documents.service';
import { Document } from './entities/document.entity';
import { CreateDocumentInput } from './dto/create-document.input';
import { UpdateDocumentInput } from './dto/update-document.input';
import { GetDocumentsPaginatedInput } from './dto/get-documents-paginated/get-documents-paginated.input';
import { GetDocumentsPaginatedResponse } from './dto/get-documents-paginated/get-documents-paginated.response';
import { GetDocumentResponse } from './dto/get-document/get-document.response';
import { RemoveDocumentOutput } from './dto/remove-document/remove-document.output';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from 'src/auth/guards/gql-auth.guard';
import { CurrentUser } from 'src/common/decorators/user.decorator';
import { User } from 'src/modules/users/entities/user.entity';
import { createResponseMetadata } from 'src/common/helpers/metadata.helper';
import { HttpStatus } from '@nestjs/common';
import { Role } from 'src/common/enums/role.enums';

@Resolver(() => Document)
@UseGuards(GqlAuthGuard)
export class DocumentsResolver {
  constructor(private readonly documentsService: DocumentsService) {}

  @Mutation(() => GetDocumentResponse)
  async createDocument(
    @Args('createDocumentInput') createDocumentInput: CreateDocumentInput,
    @Args({ name: 'file', type: () => GraphQLUpload, nullable: true })
    file?: FileUpload,
    @CurrentUser() user?: User,
  ): Promise<GetDocumentResponse> {
    console.log('=== CREATE DOCUMENT RESOLVER ===');
    console.log('User creating document:', user?.id, user?.email);
    console.log('Document input:', createDocumentInput);
    
    // Validate user permissions
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    // Check if user has permission to create documents
    const allowedRoles = [Role.CLERK, Role.DEPARTMENT_STAFF, Role.SYSTEM_ADMIN];
    if (!allowedRoles.some(role => user.roles.includes(role))) {
      throw new Error('User does not have permission to create documents');
    }
    
    const document = await this.documentsService.create(
      createDocumentInput,
      file,
      user,
    );
    
    return {
      metadata: createResponseMetadata(
        HttpStatus.CREATED,
        'Tạo văn bản thành công',
      ),
      data: { document },
    };
  }

  @Query(() => GetDocumentsPaginatedResponse, { name: 'documents' })
  async getDocumentsPaginated(
    @Args('input') input: GetDocumentsPaginatedInput,
  ): Promise<GetDocumentsPaginatedResponse> {
    const result = await this.documentsService.findPaginated(input);
    return {
      metadata: createResponseMetadata(
        HttpStatus.OK,
        'Lấy danh sách văn bản thành công',
      ),
      data: result.data,
      totalCount: result.meta.itemCount,
      hasNextPage: result.meta.hasNextPage,
    };
  }

  @Query(() => GetDocumentResponse, { name: 'document' })
  async getDocument(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<GetDocumentResponse> {
    const document = await this.documentsService.findOne(id);
    return {
      metadata: createResponseMetadata(
        HttpStatus.OK,
        'Lấy thông tin văn bản thành công',
      ),
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

  @Mutation(() => RemoveDocumentOutput)
  async removeDocument(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<RemoveDocumentOutput> {
    const result = await this.documentsService.remove(id);
    return {
      metadata: createResponseMetadata(
        HttpStatus.OK,
        'Xóa văn bản thành công',
      ),
      data: { success: result },
    };
  }
}
