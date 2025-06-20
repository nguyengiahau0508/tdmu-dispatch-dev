import { Field, InputType, Int } from "@nestjs/graphql";
import { Type } from "class-transformer";
import { IsEnum, IsInt, IsOptional, Max, Min } from "class-validator";
import { Order } from "./constants";

@InputType()
export class PageOptionsDto {
  @Field(() => Order, { nullable: true, description: 'Thứ tự sắp xếp' })
  @IsEnum(Order)
  @IsOptional()
  readonly order?: Order = Order.ASC;

  @Field(() => Int, { nullable: true, description: 'Số trang hiện tại' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  readonly page?: number = 1;

  @Field(() => Int, { nullable: true, description: 'Số lượng item trên mỗi trang' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  @IsOptional()
  readonly take?: number = 10;

  get skip(): number {
    return ((this.page ?? 1) - 1) * (this.take ?? 10);
  }
}
