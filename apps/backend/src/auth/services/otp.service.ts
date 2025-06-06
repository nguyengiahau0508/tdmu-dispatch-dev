
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';

@Injectable()
export class OtpService {
  private readonly OTP_TTL = 300000; // 5 phút

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) { }

  generateRandomOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async generateOTP(userId: Number): Promise<string> {
    const otp = this.generateRandomOtp();
    await this.cacheManager.set(`otp:${userId}`, otp, this.OTP_TTL);
    return otp;
  }

  async verifyOTP(userId: number, otp: string): Promise<boolean> {
    const storedOtp = await this.cacheManager.get<string>(`otp:${userId}`);
    if (!storedOtp) return false;

    const isValid = storedOtp === otp;
    if (isValid) {
      await this.cacheManager.del(`otp:${userId}`);
    }

    return isValid;
  }

  async clearOTP(userId: number): Promise<void> {
    await this.cacheManager.del(`otp:${userId}`);
  }
}

