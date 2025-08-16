import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Metadata } from 'src/common/graphql/metadata.dto';

@ObjectType()
export class ProcessingStatistics {
  @Field(() => Int, { description: 'Tổng số documents' })
  totalDocuments: number;

  @Field(() => Int, { description: 'Số documents đang chờ xử lý' })
  pendingCount: number;

  @Field(() => Int, { description: 'Số documents đã hoàn thành' })
  completedCount: number;

  @Field(() => Int, { description: 'Số documents đang xử lý' })
  inProgressCount: number;

  @Field(() => Number, { description: 'Tỷ lệ hoàn thành (%)' })
  completionRate: number;
}

@ObjectType()
export class ProcessingStatisticsResponse {
  @Field(() => Metadata, { description: 'Thông tin metadata của response' })
  metadata: Metadata;

  @Field(() => ProcessingStatistics, { description: 'Thống kê xử lý' })
  data: ProcessingStatistics;
}
