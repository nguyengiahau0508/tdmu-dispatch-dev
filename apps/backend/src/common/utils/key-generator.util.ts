
import { randomBytes, randomUUID } from 'crypto';

export function generateUniqueKey(): string {
  const timestamp = Date.now().toString(36); // rút gọn timestamp
  const randomPart = randomBytes(8).toString('hex'); // 16 ký tự ngẫu nhiên
  const uuidPart = randomUUID(); // UUID v4
  return `${timestamp}-${randomPart}-${uuidPart}`;
}
