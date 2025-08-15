import { Controller, Get, Param, Req, Res, UseGuards } from '@nestjs/common';
import { User } from '../users/entities/user.entity';
import { CurrentUser } from 'src/common/decorators/user.decorator';
import { FilesService } from './files.service';
import { Response } from 'express';
import { GoogleDriveService } from 'src/integrations/google-drive/google-drive.service';

@Controller('files')
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly googleDriveService: GoogleDriveService,
  ) {}

  @Get(':id/stream')
  async streamFile(
    @Param('id') id: string,
    @CurrentUser() user: User,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const { stream, fileMeta } = await this.filesService.getFileProxy(id, user);
    res.set({
      'Content-Type': fileMeta.mimeType,
      'Content-Disposition': `inline; filename="${fileMeta.originalName}"`,
    });

    stream.pipe(res);
  }

  @Get('drive/:driveFileId/download')
  async downloadFromDrive(
    @Param('driveFileId') driveFileId: string,
    @CurrentUser() user: User,
    @Res() res: Response,
  ) {
    try {
      const fileStream = await this.googleDriveService.downloadFile(driveFileId);
      const fileInfo = await this.googleDriveService.getFileInfo(driveFileId);
      
      res.set({
        'Content-Type': fileInfo.mimeType,
        'Content-Disposition': `attachment; filename="${fileInfo.name}"`,
      });

      fileStream.pipe(res);
    } catch (error) {
      res.status(404).json({ message: 'File not found or access denied' });
    }
  }
}
