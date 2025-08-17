import { ObjectType, Field } from '@nestjs/graphql';
import { UserActivity } from '../../entities/user-activity.entity';
import { Metadata } from 'src/common/graphql/metadata.dto';
import { PageMetaDto } from 'src/common/shared/pagination/page-meta.dto';

@ObjectType()
export class GetUserActivitiesResponse {
  @Field(() => Metadata)
  metadata: Metadata;

  @Field(() => [UserActivity])
  data: UserActivity[];

  @Field(() => PageMetaDto)
  meta: PageMetaDto;
}
