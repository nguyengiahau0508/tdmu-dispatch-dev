import { Module } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { DocumentsResolver } from './documents.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Document } from './entities/document.entity';
import { GoogleDriveModule } from 'src/integrations/google-drive/google-drive.module';

@Module({
  imports: [TypeOrmModule.forFeature([Document]), GoogleDriveModule],
  providers: [DocumentsResolver, DocumentsService],
})
export class DocumentsModule {}
