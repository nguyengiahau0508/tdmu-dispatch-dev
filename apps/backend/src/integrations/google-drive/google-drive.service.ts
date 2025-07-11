
import { Injectable } from '@nestjs/common';
import { drive_v3, google } from 'googleapis';
import { GoogleOauth2Service } from '../google-oauth2/google-oauth2.service';
import { Readable } from 'stream';
import { FileUpload } from 'graphql-upload-ts';

@Injectable()
export class GoogleDriveService {
  private driveClient: drive_v3.Drive;

  constructor(private readonly googleOauth2Service: GoogleOauth2Service) {
    const auth = this.googleOauth2Service.getAuthenticatedClient(); // Lấy client đã được xác thực
    this.driveClient = google.drive({ version: 'v3', auth });
  }

  private bufferToStream(buffer: any): Readable {
    // Chuyển đổi thành Buffer thực sự nếu chưa phải
    const realBuffer = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer.data);
    const stream = new Readable();
    stream.push(realBuffer);
    stream.push(null); // Kết thúc stream
    return stream;
  }

  /**
   * Lấy file từ Google Drive
   * @param fileId ID của file cần tải
   * @returns Readable Stream chứa nội dung file
   */
  async getFile(fileId: string): Promise<Readable> {
    try {
      const response = await this.driveClient.files.get(
        {
          fileId,
          alt: 'media', // Lấy dữ liệu file gốc
        },
        { responseType: 'stream' }, // Trả về dạng stream
      );

      const fileStream = response.data as Readable;
      return fileStream;
    } catch (error) {
      console.error('Error getting file:', error.message);
      throw new Error('Could not get file from Google Drive');
    }
  }


  /**
   * Lấy metadata file từ Google Drive
   */
  async getFileMetadata(fileId: string): Promise<drive_v3.Schema$File> {
    try {
      const response = await this.driveClient.files.get({
        fileId,
        fields: 'id, name, mimeType, size, parents, createdTime',
      });
      return response.data;
    } catch (error) {
      console.error('Error getting file metadata:', error.message);
      throw new Error('Could not get file metadata from Google Drive');
    }
  }

  /**
   * Upload file lên Google Drive
   */
  async uploadFile(file: FileUpload): Promise<string> {
    const { filename, mimetype, createReadStream } = file;

    const fileStream = createReadStream();

    try {
      const response = await this.driveClient.files.create({
        requestBody: {
          name: filename, // Tên file
          parents: ['1sAW8cE5xfKsnoQl0vG6Sex2g0Hmk92W0'], // Folder ID của bạn
        },
        media: {
          mimeType: mimetype,
          body: fileStream, // Dùng stream trực tiếp
        },
        fields: 'id',
      });

      const fileId = response.data.id;
      if (!fileId) {
        throw new Error('Could not get file ID after upload.');
      }

      return fileId;
    } catch (error) {
      console.error('Error uploading file:', error.message);
      throw new Error('Could not upload file to Google Drive');
    }
  }

  /**
   * Xóa file trên Google Drive
   * @param fileId ID của file cần xóa
   * @returns Thông báo thành công hoặc lỗi
   */
  async deleteFile(fileId: string): Promise<void> {
    await this.driveClient.files.delete({ fileId });
  }

  /**
   * Lấy danh sách file trên Google Drive
   * @returns Danh sách file
   */
  async listFiles(): Promise<drive_v3.Schema$File[]> {
    const response = await this.driveClient.files.list({
      pageSize: 10,
      fields: 'files(id, name)',
    });

    return response.data.files || [];
  }
}
