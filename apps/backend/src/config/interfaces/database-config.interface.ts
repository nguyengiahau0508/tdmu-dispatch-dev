// src/config/interfaces/database-config.interface.ts
export default interface IDatabaseConfig {
  type: string; // ví dụ: 'postgres', 'mysql', 'mongodb'
  host: string;
  port: number;
  username?: string; // Có thể không cần cho một số loại DB như MongoDB local
  password?: string; // Có thể không cần
  database: string;
  synchronize: boolean; // Cho TypeORM: true cho dev, false cho prod
  logging: boolean;
  url?: string; // Chuỗi kết nối đầy đủ, có thể thay thế các trường trên
}
