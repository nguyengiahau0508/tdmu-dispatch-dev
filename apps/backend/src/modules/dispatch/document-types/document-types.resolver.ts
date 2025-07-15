import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { DocumentTypesService } from './document-types.service';
import { DocumentType } from './entities/document-type.entity';
import { CreateDocumentTypeInput } from './dto/create-document-type.input';
import { UpdateDocumentTypeInput } from './dto/update-document-type.input';

@Resolver(() => DocumentType)
export class DocumentTypesResolver {
  constructor(private readonly documentTypesService: DocumentTypesService) {}

  @Mutation(() => DocumentType)
  createDocumentType(@Args('createDocumentTypeInput') createDocumentTypeInput: CreateDocumentTypeInput) {
    return this.documentTypesService.create(createDocumentTypeInput);
  }

  @Query(() => [DocumentType], { name: 'documentTypes' })
  findAll() {
    return this.documentTypesService.findAll();
  }

  @Query(() => DocumentType, { name: 'documentType' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.documentTypesService.findOne(id);
  }

  @Mutation(() => DocumentType)
  updateDocumentType(@Args('updateDocumentTypeInput') updateDocumentTypeInput: UpdateDocumentTypeInput) {
    return this.documentTypesService.update(updateDocumentTypeInput.id, updateDocumentTypeInput);
  }

  @Mutation(() => DocumentType)
  removeDocumentType(@Args('id', { type: () => Int }) id: number) {
    return this.documentTypesService.remove(id);
  }
}
