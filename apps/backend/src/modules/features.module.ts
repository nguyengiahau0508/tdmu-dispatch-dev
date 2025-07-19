import { Module } from "@nestjs/common";
import { UsersModule } from "./users/users.module";
import { OraganizationalModule } from "./organizational/oraganizational.module";
import { FilesModule } from './files/files.module';
import { DispatchModule } from "./dispatch/dispatch.module";
import { WorkflowModule } from "./workflow/workflow.module";

@Module({
  imports: [
    UsersModule,
    OraganizationalModule,
    FilesModule,
    WorkflowModule,
    DispatchModule
  ],
  providers: []
})
export class FeaturesModule { }
