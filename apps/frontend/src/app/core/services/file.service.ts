
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthState } from '../state/auth.state';

@Injectable({ providedIn: 'root' })
export class FileService {
  private readonly apiUrl = environment.apiBaseUrl
  constructor(
    private authState: AuthState,
    private http: HttpClient) { }

  /**
   * Lấy URL tạm từ fileId
   * @param fileId Mã định danh file
   * @returns URL tạm để hiển thị hoặc tải file
   */

  async getFileUrl(fileId: number): Promise<string> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.authState.getAccessToken()}`
    });

    const blob = await firstValueFrom(
      this.http.get(`${this.apiUrl}/files/${fileId}/stream`, {
        responseType: 'blob',
        headers,
      })
    );

    if (!blob) {
      throw new Error(`Không tải được file với ID: ${fileId}`);
    }

    return URL.createObjectURL(blob);
  }

  /**
   * Tải file từ Google Drive
   * @param driveFileId Google Drive file ID
   * @returns Observable với blob data
   */
  downloadFromDrive(driveFileId: string): Observable<Blob> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.authState.getAccessToken()}`
    });

    return this.http.get(`${this.apiUrl}/files/drive/${driveFileId}/download`, {
      responseType: 'blob',
      headers,
    });
  }

  /**
   * Tạo URL để tải file từ Google Drive
   * @param driveFileId Google Drive file ID
   * @returns Promise với URL
   */
  async getDriveFileUrl(driveFileId: string): Promise<string> {
    const blob = await firstValueFrom(this.downloadFromDrive(driveFileId));
    return URL.createObjectURL(blob);
  }

  /**
   * Tải file và tự động download
   * @param driveFileId Google Drive file ID
   * @param fileName Tên file để download
   */
  async downloadFile(driveFileId: string, fileName: string): Promise<void> {
    try {
      const url = await this.getDriveFileUrl(driveFileId);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
      throw error;
    }
  }

}

