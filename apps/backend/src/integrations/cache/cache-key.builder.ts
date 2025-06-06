export class CacheKeyBuilder {
  static otpForUser(userId: number): string {
    return `otp:user:${userId}`;
  }

  static tokenForUser(userId: number): string {
    return `token:user:${userId}`;
  }
}
