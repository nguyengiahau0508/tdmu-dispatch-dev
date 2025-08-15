// src/core/database/database.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { IDatabaseConfig } from '../../config/interfaces';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule], // Đảm bảo ConfigModule có sẵn (AppConfigModule đã làm isGlobal: true)
      useFactory: (configService: ConfigService): TypeOrmModuleOptions => {
        const dbConfig = configService.get<IDatabaseConfig>('database');
        return {
          type: dbConfig?.type as any,
          host: dbConfig?.host,
          port: dbConfig?.port,
          username: dbConfig?.username,
          password: dbConfig?.password,
          database: dbConfig?.database,
          entities: dbConfig?.entities,
          synchronize: dbConfig?.synchronize,
          logging: dbConfig?.logging,
          migrations: dbConfig?.migrations,
          migrationsRun: dbConfig?.migrationsRun,
          timezone: dbConfig?.timezone,
          charset: dbConfig?.charset,
          autoLoadEntities: true, // Cân nhắc sử dụng nếu entities được forFeature ở các module khác
        };
      },
      inject: [ConfigService],
    }),
  ],
  // Không cần exports TypeOrmModule.forRootAsync() vì nó đã thiết lập kết nối toàn cục.
  // Bạn sẽ exports TypeOrmModule.forFeature() từ các feature modules.
})
export class DatabaseModule {}
