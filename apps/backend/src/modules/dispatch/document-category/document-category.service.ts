import { Injectable } from '@nestjs/common';
import { CreateDocumentCategoryInput } from './dto/create-document-category.input';
import { UpdateDocumentCategoryInput } from './dto/update-document-category.input';

@Injectable()
export class DocumentCategoryService {
  create(createDocumentCategoryInput: CreateDocumentCategoryInput) {
    return 'This action adds a new documentCategory';
  }

  findAll() {
    return `This action returns all documentCategory`;
  }

  findOne(id: number) {
    return `This action returns a #${id} documentCategory`;
  }

  update(id: number, updateDocumentCategoryInput: UpdateDocumentCategoryInput) {
    return `This action updates a #${id} documentCategory`;
  }

  remove(id: number) {
    return `This action removes a #${id} documentCategory`;
  }
}
