import { Field, InputType } from '@nestjs/graphql';
import { IsOptional, IsString } from 'class-validator';
import { PageOptionsDto } from 'src/common/shared/pagination/dtos';

@InputType({
  description:
    'Dữ liệu đầu vào để lấy danh sách workflow template có phân trang',
})
export class GetWorkflowTemplatePaginatedInput extends PageOptionsDto {
  @Field(() => String, { nullable: true, description: 'Từ khóa tìm kiếm' })
  @IsString()
  @IsOptional()
  search?: string;
}
