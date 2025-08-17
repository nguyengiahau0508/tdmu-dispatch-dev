import { ObjectType, Field } from '@nestjs/graphql';
import { User } from '../../entities/user.entity';
import { Metadata } from 'src/common/graphql/metadata.dto';

@ObjectType()
export class UpdateProfileResponse {
  @Field(() => Metadata)
  metadata: Metadata;

  @Field(() => User)
  data: User;
}
