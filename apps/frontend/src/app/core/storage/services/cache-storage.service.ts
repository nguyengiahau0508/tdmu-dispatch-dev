
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class CacheStorageService {
  private readonly cacheName = 'my-app-cache';

  /**
   * Thêm URL vào cache (fetch và cache)
   * @param request URL hoặc Request object
   */
  async addToCache(request: RequestInfo): Promise<void> {
    const cache = await caches.open(this.cacheName);
    await cache.add(request);
  }

  /**
   * Đặt response tùy ý vào cache
   * @param request URL hoặc Request object
   * @param response Response object
   */
  async putInCache(request: RequestInfo, response: Response): Promise<void> {
    const cache = await caches.open(this.cacheName);
    await cache.put(request, response);
  }

  /**
   * Lấy response từ cache
   * @param request URL hoặc Request object
   * @returns Response hoặc undefined nếu không có
   */
  async getFromCache(request: RequestInfo): Promise<Response | undefined> {
    const cache = await caches.open(this.cacheName);
    const response = await cache.match(request);
    return response ?? undefined;
  }

  /**
   * Xóa 1 mục trong cache
   * @param request URL hoặc Request object
   * @returns true nếu xóa thành công
   */
  async deleteFromCache(request: RequestInfo): Promise<boolean> {
    const cache = await caches.open(this.cacheName);
    return cache.delete(request);
  }

  /**
   * Xóa toàn bộ cache (clear hết trong cacheName này)
   */
  async clearCache(): Promise<void> {
    await caches.delete(this.cacheName);
  }
}

