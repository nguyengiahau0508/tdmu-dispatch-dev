
import { Injectable } from '@angular/core';
import { LocalStorageService } from './services/local-storage.service';
import { SessionStorageService } from './services/session-storage.service';
import { CacheStorageService } from './services/cache-storage.service';
import { IndexedDbStorageService } from './services/indexed-db.service';

@Injectable({ providedIn: 'root' })
export class StorageService {
  constructor(
    public local: LocalStorageService,
    public session: SessionStorageService,
    public cache: CacheStorageService,
    public indexedDB: IndexedDbStorageService
    // thêm indexedDB, cache nếu cần
  ) { }
}
