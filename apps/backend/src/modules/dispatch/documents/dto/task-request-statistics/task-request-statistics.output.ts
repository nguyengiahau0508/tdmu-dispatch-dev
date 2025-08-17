import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType({ description: 'Thống kê task request' })
export class TaskRequestStatistics {
  @Field(() => Int, { description: 'Tổng số task request' })
  total: number;

  @Field(() => Int, { description: 'Số task request đang chờ xử lý' })
  pending: number;

  @Field(() => Int, { description: 'Số task request đã được phê duyệt' })
  approved: number;

  @Field(() => Int, { description: 'Số task request đã bị từ chối' })
  rejected: number;

  @Field(() => Int, { description: 'Số task request đã bị hủy' })
  cancelled: number;
}
