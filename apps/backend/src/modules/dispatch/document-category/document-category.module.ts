import { Module } from '@nestjs/common';
import { DocumentCategoryService } from './document-category.service';
import { DocumentCategoryResolver } from './document-category.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentCategory } from './entities/document-category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DocumentCategory])],
  providers: [DocumentCategoryResolver, DocumentCategoryService],
})
export class DocumentCategoryModule {}
