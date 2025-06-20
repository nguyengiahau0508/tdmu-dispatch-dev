import { Field, ObjectType } from "@nestjs/graphql";
import { IsArray } from "class-validator";
import { PageMetaDto } from "./page-meta.dto";

@ObjectType({ isAbstract: true })
export class PageDto<T> {
  @Field(() => [Object])
  @IsArray()
  readonly data: T[];

  @Field(() => PageMetaDto)
  readonly meta: PageMetaDto;

  constructor(data: T[], meta: PageMetaDto) {
    this.data = data;
    this.meta = meta;
  }
}
