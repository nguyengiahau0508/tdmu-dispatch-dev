import { Global, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthResolver } from './auth.resolver';
import { UsersModule } from 'src/modules/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { IJwtConfig } from 'src/config/interfaces';
import { JwtStrategy } from './strategies/jwt.strategy';

@Global()
@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const jwtConfig = configService.get<IJwtConfig>('jwt');
        return {
          secret: jwtConfig?.secret
        }
      },
      inject: [ConfigService]
    }),
    ConfigModule,
    UsersModule
  ],
  providers: [AuthResolver, JwtStrategy, AuthService],
  exports: [AuthService]
})
export class AuthModule { }
