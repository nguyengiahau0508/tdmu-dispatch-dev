import { Module } from "@nestjs/common";
import { UsersModule } from "./users/users.module";
import { OraganizationalModule } from "./organizational/oraganizational.module";
import { FilesModule } from './files/files.module';
import { ApprovalModule } from "./approval/approval.module";
import { DispatchModule } from "./dispatch/dispatch.module";

@Module({
  imports: [
    UsersModule,
    OraganizationalModule,
    FilesModule,
    ApprovalModule,
    DispatchModule
  ],
  providers: []
})
export class FeaturesModule { }
