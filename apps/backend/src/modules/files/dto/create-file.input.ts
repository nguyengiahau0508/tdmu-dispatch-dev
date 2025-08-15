import { InputType, Field, Int } from '@nestjs/graphql';

@InputType()
export class CreateFileInput {
  @Field(() => String)
  driveFileId: string;

  @Field(() => String)
  originalName: string;

  @Field(() => String)
  mimeType: string;

  @Field(() => [Int], { nullable: true })
  allowedUserIds?: number[];

  @Field(() => Boolean)
  isPublic: boolean;
}
