import { Field, InputType } from "@nestjs/graphql";
import { PageOptionsDto } from "src/common/shared/pagination/dtos";


@InputType()
export class GetWorkflowTemplatePaginatedInput extends PageOptionsDto {
  @Field({ nullable: true })
  search?: string
}
