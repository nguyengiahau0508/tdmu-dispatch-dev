export class CacheKeyBuilder {
  static otpForUser(userId: number): string {
    return `otp:user:${userId}`;
  }

  static token(tokenId: string): string {
    return `token:user:${tokenId}`;
  }
}
