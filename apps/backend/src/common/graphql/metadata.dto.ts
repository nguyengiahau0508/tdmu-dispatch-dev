import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType({ description: 'Thông tin metadata chung cho các response' })
export class Metadata {
  @Field(() => Int, {
    description: 'Mã trạng thái HTTP (hoặc mã lỗi tùy chỉnh)',
  })
  statusCode: number;

  @Field(() => String, {
    nullable: true,
    description: 'Thông báo thành công hoặc lỗi',
  })
  message?: string;

  @Field(() => String, { description: 'Dấu thời gian của response' })
  timestamp: string;

  @Field(() => String, {
    nullable: true,
    description: 'Đường dẫn của request (nếu có)',
  })
  path?: string;

  // Bạn có thể thêm các trường metadata khác nếu cần
  // Ví dụ: requestId, version, etc.
}
