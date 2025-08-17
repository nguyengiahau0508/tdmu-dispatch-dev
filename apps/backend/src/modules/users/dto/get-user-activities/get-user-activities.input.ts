import { InputType, Field, Int } from '@nestjs/graphql';
import { IsOptional, IsInt, Min, Max } from 'class-validator';
import { ActivityType } from '../../entities/user-activity.entity';

@InputType()
export class GetUserActivitiesInput {
  @Field(() => Int, { defaultValue: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @Field(() => Int, { defaultValue: 10 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @Field(() => ActivityType, { nullable: true })
  @IsOptional()
  activityType?: ActivityType;

  @Field(() => String, { nullable: true })
  @IsOptional()
  startDate?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  endDate?: string;
}
