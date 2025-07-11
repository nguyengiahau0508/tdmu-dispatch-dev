import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class StreamFileOutput {
  @Field(() => String)
  id: string;

  @Field(() => String)
  originalName: string;

  @Field(() => String)
  mimeType: string;

  @Field(() => String)
  fileData: string; // Base64 encoded file content

  @Field(() => Boolean)
  isPublic: boolean;
} 