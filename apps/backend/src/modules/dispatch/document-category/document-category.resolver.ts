import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { DocumentCategoryService } from './document-category.service';
import { DocumentCategory } from './entities/document-category.entity';
import { CreateDocumentCategoryInput } from './dto/create-document-category.input';
import { UpdateDocumentCategoryInput } from './dto/update-document-category.input';

@Resolver(() => DocumentCategory)
export class DocumentCategoryResolver {
  constructor(private readonly documentCategoryService: DocumentCategoryService) {}

  @Mutation(() => DocumentCategory)
  createDocumentCategory(@Args('createDocumentCategoryInput') createDocumentCategoryInput: CreateDocumentCategoryInput) {
    return this.documentCategoryService.create(createDocumentCategoryInput);
  }

  @Query(() => [DocumentCategory], { name: 'documentCategory' })
  findAll() {
    return this.documentCategoryService.findAll();
  }

  @Query(() => DocumentCategory, { name: 'documentCategory' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.documentCategoryService.findOne(id);
  }

  @Mutation(() => DocumentCategory)
  updateDocumentCategory(@Args('updateDocumentCategoryInput') updateDocumentCategoryInput: UpdateDocumentCategoryInput) {
    return this.documentCategoryService.update(updateDocumentCategoryInput.id, updateDocumentCategoryInput);
  }

  @Mutation(() => DocumentCategory)
  removeDocumentCategory(@Args('id', { type: () => Int }) id: number) {
    return this.documentCategoryService.remove(id);
  }
}
