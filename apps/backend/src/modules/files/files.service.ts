import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UpdateFileInput } from './dto/update-file.input';
import { InjectRepository } from '@nestjs/typeorm';
import { File } from './entities/file.entity';
import { Repository } from 'typeorm';
import { GoogleDriveService } from 'src/integrations/google-drive/google-drive.service';
import { User } from '../users/entities/user.entity';
import { CreateFileInput } from './dto/create-file.input';

@Injectable()
export class FilesService {
  constructor(
    @InjectRepository(File) private readonly repository: Repository<File>,
    private readonly googleDriveService: GoogleDriveService,
  ) {}

  async checkAccess(user: User, file: File) {
    if (file.isPublic) return true;
    if (file.allowedUserIds?.includes(user.id)) return true;
    throw new ForbiddenException('No permission for this file');
  }

  /**
   * Trả stream file từ Google Drive, sau khi kiểm tra quyền
   */
  async getFileProxy(fileId: string, user: User) {
    const fileMeta = await this.repository.findOne({ where: { id: fileId } });
    if (!fileMeta) throw new NotFoundException('File not found');

    await this.checkAccess(user, fileMeta);

    const stream = await this.googleDriveService.getFile(fileMeta.driveFileId);

    return { stream, fileMeta };
  }

  /**
   * Lấy thông tin file để stream qua GraphQL
   */
  async getFileStreamInfo(fileId: string, user: User) {
    const fileMeta = await this.repository.findOne({ where: { id: fileId } });
    if (!fileMeta) throw new NotFoundException('File not found');

    await this.checkAccess(user, fileMeta);

    // Lấy file content từ Google Drive
    const stream = await this.googleDriveService.getFile(fileMeta.driveFileId);

    // Chuyển đổi stream thành buffer
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(Buffer.from(chunk));
    }
    const buffer = Buffer.concat(chunks);

    // Encode thành base64
    const base64Data = buffer.toString('base64');

    return {
      id: fileMeta.id,
      originalName: fileMeta.originalName,
      mimeType: fileMeta.mimeType,
      fileData: base64Data,
      isPublic: fileMeta.isPublic,
    };
  }

  create(createFileInput: CreateFileInput) {
    return this.repository.create(createFileInput);
  }

  findAll() {
    return `This action returns all files`;
  }

  findOne(id: number) {
    return `This action returns a #${id} file`;
  }

  update(id: number, updateFileInput: UpdateFileInput) {
    return `This action updates a #${id} file`;
  }

  remove(id: number) {
    return `This action removes a #${id} file`;
  }
}
