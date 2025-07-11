
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
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
        headers, // 👈 chuẩn, không phải setHeaders
      })
    );

    if (!blob) {
      throw new Error(`Không tải được file với ID: ${fileId}`);
    }

    return URL.createObjectURL(blob);
  }

}

