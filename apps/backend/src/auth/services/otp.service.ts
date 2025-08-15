import { Injectable } from '@nestjs/common';
import { CacheKeyBuilder } from 'src/integrations/cache/cache-key.builder';
import { CacheService } from 'src/integrations/cache/cache.service';

@Injectable()
export class OtpService {
  private readonly OTP_TTL_SECONDS = 300;

  constructor(private readonly cacheService: CacheService) {}

  async generateOTP(userId: number): Promise<string> {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const key = CacheKeyBuilder.otpForUser(userId);
    await this.cacheService.set(key, otp, this.OTP_TTL_SECONDS);
    return otp;
  }

  async validateOTP(userId: number, otp: string): Promise<boolean> {
    const key = CacheKeyBuilder.otpForUser(userId);
    const cachedOtp = await this.cacheService.get<string>(key);
    if (cachedOtp && cachedOtp === otp) {
      await this.cacheService.del(key);
      return true;
    }
    return false;
  }

  async clearOTP(userId: number) {
    const key = CacheKeyBuilder.otpForUser(userId);
    await this.cacheService.del(key);
  }
}
