import { Controller, Get, Param, Req, Res, UseGuards } from '@nestjs/common';
import { User } from '../users/entities/user.entity';
import { CurrentUser } from 'src/common/decorators/user.decorator';
import { FilesService } from './files.service';
import { Response } from 'express';
import { GoogleDriveService } from 'src/integrations/google-drive/google-drive.service';

// Helper function to sanitize filename for HTTP headers
function sanitizeFilename(filename: string): string {
  // Remove or replace invalid characters
  return filename
    .replace(/[^\w\s\-\.]/g, '_') // Replace special chars with underscore
    .replace(/\s+/g, '_') // Replace spaces with underscore
    .substring(0, 100); // Limit length
}

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
    console.log('Download request for file:', driveFileId);
    console.log('User:', user?.id);
    
    try {
      console.log('Getting file stream...');
      const fileStream = await this.googleDriveService.downloadFile(driveFileId);
      console.log('Getting file info...');
      const fileInfo = await this.googleDriveService.getFileInfo(driveFileId);
      
      console.log('File info:', fileInfo);
      
      // Sanitize filename for HTTP headers
      const sanitizedFilename = sanitizeFilename(fileInfo.name);
      const encodedFilename = encodeURIComponent(fileInfo.name);
      
      res.set({
        'Content-Type': fileInfo.mimeType,
        'Content-Disposition': `attachment; filename="${sanitizedFilename}"; filename*=UTF-8''${encodedFilename}`,
      });

      fileStream.pipe(res);
    } catch (error) {
      console.error('Error downloading file:', error);
      res.status(404).json({ 
        message: 'File not found or access denied',
        error: error.message,
        fileId: driveFileId
      });
    }
  }

  @Get('drive/:driveFileId/test')
  async testFileAccess(
    @Param('driveFileId') driveFileId: string,
    @CurrentUser() user: User,
    @Res() res: Response,
  ) {
    console.log('Test request for file:', driveFileId);
    console.log('User:', user?.id);
    
    try {
      console.log('Getting file metadata...');
      const fileInfo = await this.googleDriveService.getFileMetadata(driveFileId);
      console.log('File metadata:', fileInfo);
      
      res.json({
        success: true,
        fileInfo,
        sanitizedFilename: sanitizeFilename(fileInfo.name || ''),
        user: user?.id
      });
    } catch (error) {
      console.error('Error testing file access:', error);
      res.status(404).json({ 
        success: false,
        message: 'File not found or access denied',
        error: error.message,
        fileId: driveFileId,
        user: user?.id
      });
    }
  }
}
