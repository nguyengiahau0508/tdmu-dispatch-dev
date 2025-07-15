import { Module } from "@nestjs/common";
import { DocumentsModule } from "./documents/documents.module";
import { DocumentCategoryModule } from './document-category/document-category.module';
import { DocumentTypesModule } from "./document-types/document-types.module";


@Module({
    imports: [DocumentsModule, DocumentTypesModule, DocumentCategoryModule]
})
export class DispatchModule{}