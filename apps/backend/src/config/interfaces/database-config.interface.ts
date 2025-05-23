// src/config/interfaces/database-config.interface.ts
export default interface IDatabaseConfig {
  type: 'mariadb' | 'mysql' | 'postgres' | string; // ví dụ: 'postgres', 'mysql', 'mongodb'
  host: string;
  port: number;
  username?: string; // Có thể không cần cho một số loại DB như MongoDB local
  password?: string; // Có thể không cần
  database: string;
  synchronize: boolean; // Cho TypeORM: true cho dev, false cho prod
  logging: boolean | ('query' | 'error' | 'schema' | 'warn' | 'info' | 'log')[];
  entities: string[]; // Đường dẫn đến các entity
  migrations?: string[]; // Đường dẫn đến migrations
  migrationsRun?: boolean; // Tự động chạy migrations khi khởi động
  timezone?: string; // Ví dụ: 'Z' cho UTC, '+07:00'
  charset?: string; // Ví dụ: 'utf8mb4_unicode_ci'
  url?: string; // Chuỗi kết nối đầy đủ, có thể thay thế các trường trên
}
