import { IAssignment } from "../../../../core/interfaces/oraganizational.interface";
import { IPaginatedResponse } from "../../../../shared/models/api-response.model";

export interface IGetAssignmentsPaginatedInput extends IPaginatedResponse<IAssignment> {
}
