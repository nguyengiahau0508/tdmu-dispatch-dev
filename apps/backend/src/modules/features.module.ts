import { Module } from "@nestjs/common";
import { UsersModule } from "./users/users.module";
import { OraganizationalModule } from "./organizational/oraganizational.module";
import { FilesModule } from './files/files.module';
import { DocumentsModule } from './documents/documents.module';

@Module({
  imports: [
    UsersModule,
    OraganizationalModule,
    FilesModule,
    DocumentsModule,
  ],
  providers: []
})
export class FeaturesModule { }
