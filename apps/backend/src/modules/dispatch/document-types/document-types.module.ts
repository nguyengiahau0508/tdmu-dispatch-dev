import { Module } from '@nestjs/common';
import { DocumentTypesService } from './document-types.service';
import { DocumentTypesResolver } from './document-types.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentType } from './entities/document-type.entity';
@Module({
  imports: [TypeOrmModule.forFeature([DocumentType])],
  providers: [DocumentTypesResolver, DocumentTypesService],
})
export class DocumentTypesModule {}
