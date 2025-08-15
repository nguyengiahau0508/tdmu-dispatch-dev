import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as configFactories from '../../config/factories';
import { enviromentSchema } from 'src/config/schemas';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: process.env.NODE_ENV === 'production',
      envFilePath: [`.env.${process.env.NODE_ENV || 'development'}`, '.env'],
      load: Object.values(configFactories),
      validationSchema: enviromentSchema,
      validationOptions: {
        allowUnknown: true,
        abortEarly: false,
      },
    }),
  ],
})
export default class AppConfigModule {}
