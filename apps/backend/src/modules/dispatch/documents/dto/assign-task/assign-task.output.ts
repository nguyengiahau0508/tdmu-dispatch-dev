import { Field, ObjectType, Int } from '@nestjs/graphql';
import { Document } from '../../entities/document.entity';
import { User } from 'src/modules/users/entities/user.entity';

@ObjectType()
export class AssignTaskOutput {
  @Field(() => Int)
  id: number;

  @Field(() => Document)
  document: Document;

  @Field(() => User)
  assignedToUser: User;

  @Field(() => User)
  assignedByUser: User;

  @Field({ nullable: true })
  taskDescription?: string;

  @Field({ nullable: true })
  deadline?: Date;

  @Field({ nullable: true })
  instructions?: string;

  @Field({ nullable: true })
  notes?: string;

  @Field()
  assignedAt: Date;

  @Field({ nullable: true })
  completedAt?: Date;

  @Field()
  status: string; // 'PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'
}
