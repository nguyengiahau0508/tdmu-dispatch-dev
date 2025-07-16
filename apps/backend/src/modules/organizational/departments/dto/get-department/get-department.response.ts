import { ObjectType } from "@nestjs/graphql";
import { ApiResponse } from "src/common/graphql/api-response.dto";
import { GetDepartmentOutput } from "./get-department.output";

@ObjectType()
export class GetDepartmentResponse extends ApiResponse(GetDepartmentOutput) {
  // This class can be extended with additional fields if needed in the future
}