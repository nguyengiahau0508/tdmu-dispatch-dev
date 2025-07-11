import { Module } from '@nestjs/common';
import { FilesService } from './files.service';
import { FilesResolver } from './files.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { File } from './entities/file.entity';
import { GoogleDriveModule } from 'src/integrations/google-drive/google-drive.module';
import { FilesController } from './files.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([File]),
    GoogleDriveModule
  ],
  providers: [FilesResolver, FilesService],
  controllers: [FilesController],
  exports: [FilesService]
})
export class FilesModule { }
