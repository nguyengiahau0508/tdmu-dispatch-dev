import { Field, InputType, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

@InputType()
export class CreateWorkflowInstanceInput {
  @Field(() => Int)
  @IsNotEmpty()
  @IsNumber()
  templateId: number;

  @Field(() => Int)
  @IsNotEmpty()
  @IsNumber()
  documentId: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;
}
