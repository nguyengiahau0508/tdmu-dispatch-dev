import { Field, Int, ObjectType } from "@nestjs/graphql";
import { PageMetaDtoParameters } from "./interface";

@ObjectType()
export class PageMetaDto {
  @Field(() => Int)
  readonly page: number;

  @Field(() => Int)
  readonly take: number;

  @Field(() => Int)
  readonly itemCount: number;

  @Field(() => Int)
  readonly pageCount: number;

  @Field(() => Boolean)
  readonly hasPreviousPage: boolean;

  @Field(() => Boolean)
  readonly hasNextPage: boolean;

  constructor({ pageOptionsDto, itemCount }: PageMetaDtoParameters) {
    this.page = pageOptionsDto.page ?? 1;
    this.take = pageOptionsDto.take ?? 10;
    this.itemCount = itemCount;
    this.pageCount = Math.ceil(this.itemCount / this.take);
    this.hasPreviousPage = this.page > 1;
    this.hasNextPage = this.page < this.pageCount;
  }
}
