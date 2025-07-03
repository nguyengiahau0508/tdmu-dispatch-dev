import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Metadata } from 'src/common/graphql/metadata.dto';
import { User } from '../../entities/user.entity';

@ObjectType()
export class GetUsersPaginatedResponse {
  @Field(() => [User], { nullable: true })
  data?: User[];

  @Field(() => Metadata)
  metadata: Metadata;

  @Field(() => Int)
  totalCount: number;

  @Field(() => Boolean)
  hasNextPage: boolean;
} 
