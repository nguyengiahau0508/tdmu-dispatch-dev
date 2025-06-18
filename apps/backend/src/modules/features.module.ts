import { Module } from "@nestjs/common";
import { UsersModule } from "./users/users.module";
import { OraganizationalModule } from "./organizational/oraganizational.module";

@Module({
  imports: [
    UsersModule,
    OraganizationalModule
  ],
  providers: []
})
export class FeaturesModule { }
