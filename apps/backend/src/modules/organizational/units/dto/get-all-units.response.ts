import { ObjectType, Field } from '@nestjs/graphql';
import { Unit } from '../entities/unit.entity';
import { Metadata } from 'src/common/graphql/metadata.dto';

@ObjectType()
export class GetAllUnitsResponse {
  @Field(() => [Unit], { nullable: true })
  data?: Unit[];

  @Field(() => Metadata)
  metadata: Metadata;
} 