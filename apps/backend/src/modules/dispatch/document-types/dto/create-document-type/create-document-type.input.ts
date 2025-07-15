import { InputType } from "@nestjs/graphql";
import { Field } from "@nestjs/graphql";
import { IsString, IsOptional } from "class-validator";
@InputType()
export class CreateDocumentTypeInput {
    @Field()
    @IsString()
    name: string;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    description?: string;
}