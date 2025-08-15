import { Field, InputType } from "@nestjs/graphql";
import { IsOptional, IsString, IsEnum } from "class-validator";
import { PageOptionsDto } from "src/common/shared/pagination/dtos";
import { WorkflowStatus } from "../../entities/workflow-instance.entity";

@InputType({ description: 'Dữ liệu đầu vào để lấy danh sách workflow instances có phân trang' })
export class GetWorkflowInstancePaginatedInput extends PageOptionsDto {
  @Field(() => String, { nullable: true, description: 'Từ khóa tìm kiếm' })
  @IsString()
  @IsOptional()
  search?: string;

  @Field(() => WorkflowStatus, { nullable: true, description: 'Lọc theo trạng thái' })
  @IsEnum(WorkflowStatus)
  @IsOptional()
  status?: WorkflowStatus;

  @Field(() => Number, { nullable: true, description: 'Lọc theo user ID' })
  @IsOptional()
  createdByUserId?: number;
}
