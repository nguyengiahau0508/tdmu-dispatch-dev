import { Field, InputType, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsString, IsInt, IsDateString, IsEnum } from 'class-validator';
import { DocumentPriority } from '../../entities/document.entity';

@InputType()
export class AssignTaskInput {
  @Field(() => Int)
  @IsInt()
  @IsNotEmpty()
  documentId: number;

  @Field(() => Int)
  @IsInt()
  @IsNotEmpty()
  assignedToUserId: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  taskDescription?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  deadline?: string;

  @Field(() => DocumentPriority, { nullable: true })
  @IsOptional()
  @IsEnum(DocumentPriority)
  priority?: DocumentPriority;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  instructions?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;
}
