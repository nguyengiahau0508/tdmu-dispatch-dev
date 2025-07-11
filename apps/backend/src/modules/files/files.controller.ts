import { Controller, Get, Param, Req, Res, UseGuards } from "@nestjs/common";
import { User } from "../users/entities/user.entity";
import { CurrentUser } from "src/common/decorators/user.decorator";
import { FilesService } from "./files.service";
import { Response } from "express";

@Controller('files')
export class FilesController {
  constructor(
    private readonly filesService: FilesService
  ) { }

  @Get(':id/stream')
  async streamFile(
    @Param('id') id: string,
    @CurrentUser() user: User,
    @Res() res: Response,
    @Req() req: Request
  ) {
    const { stream, fileMeta } = await this.filesService.getFileProxy(id, user);
    res.set({
      'Content-Type': fileMeta.mimeType,
      'Content-Disposition': `inline; filename="${fileMeta.originalName}"`,
    });

    stream.pipe(res);
  }
}
