import { ObjectType, Field } from '@nestjs/graphql';
import { Position } from '../entities/position.entity';
import { Metadata } from 'src/common/graphql/metadata.dto';

@ObjectType()
export class GetAllPositionsResponse {
  @Field(() => [Position], { nullable: true })
  data?: Position[];

  @Field(() => Metadata)
  metadata: Metadata;
} 