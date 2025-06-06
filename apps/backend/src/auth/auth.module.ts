import { Global, Module } from '@nestjs/common';
import { AuthResolver } from './auth.resolver';
import { UsersModule } from 'src/modules/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { IJwtConfig } from 'src/config/interfaces';
import { JwtStrategy } from './strategies/jwt.strategy';
import { AuthService } from './services/auth.service';
import { OtpService } from './services/otp.service';

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
  providers: [AuthResolver, JwtStrategy, AuthService, OtpService],
  exports: [AuthService]
})
export class AuthModule { }
