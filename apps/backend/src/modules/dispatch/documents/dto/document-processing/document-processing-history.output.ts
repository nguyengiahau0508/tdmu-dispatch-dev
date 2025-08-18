import { Field, ObjectType, Int } from '@nestjs/graphql';
import { User } from 'src/modules/users/entities/user.entity';
import { ActionType } from 'src/modules/workflow/workflow-action-logs/entities/workflow-action-log.entity';

@ObjectType()
export class DocumentProcessingHistoryItem {
  @Field(() => Int)
  id: number;

  @Field(() => ActionType)
  actionType: ActionType;

  @Field(() => User, { nullable: true })
  actionByUser?: User;

  @Field(() => Date)
  actionAt: Date;

  @Field({ nullable: true })
  note?: string;

  @Field({ nullable: true })
  metadata?: string;

  @Field()
  stepName: string;

  @Field()
  stepType: string;

  @Field(() => Date)
  createdAt: Date;
}

@ObjectType()
export class DocumentProcessingHistoryResponse {
  @Field(() => [DocumentProcessingHistoryItem])
  data: DocumentProcessingHistoryItem[];

  @Field(() => Int)
  totalCount: number;
}
