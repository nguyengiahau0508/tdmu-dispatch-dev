import { Module } from "@nestjs/common";
import { MailModule } from "./mail/mail.module";
import { CacheAppModule } from "./cache/cache.module";

@Module({
  imports: [
    MailModule,
    CacheAppModule
  ]
})
export class IntegrationsModule { }
