import { Module } from "@nestjs/common";
import { DocumentsModule } from "./documents/documents.module";
import { DocumentCategoryModule } from './document-category/document-category.module';
import { DocumentTypesModule } from "./document-types/document-types.module";
import { FilesModule } from "../files/files.module";
import { GoogleDriveModule } from "src/integrations/google-drive/google-drive.module";


@Module({
    imports: [DocumentsModule, DocumentTypesModule, DocumentCategoryModule, FilesModule, GoogleDriveModule]
})
export class DispatchModule{}