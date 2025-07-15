import { Injectable } from '@nestjs/common';
import { CreateDocumentTypeInput } from './dto/create-document-type.input';
import { UpdateDocumentTypeInput } from './dto/update-document-type.input';

@Injectable()
export class DocumentTypesService {
  create(createDocumentTypeInput: CreateDocumentTypeInput) {
    return 'This action adds a new documentType';
  }

  findAll() {
    return `This action returns all documentTypes`;
  }

  findOne(id: number) {
    return `This action returns a #${id} documentType`;
  }

  update(id: number, updateDocumentTypeInput: UpdateDocumentTypeInput) {
    return `This action updates a #${id} documentType`;
  }

  remove(id: number) {
    return `This action removes a #${id} documentType`;
  }
}
