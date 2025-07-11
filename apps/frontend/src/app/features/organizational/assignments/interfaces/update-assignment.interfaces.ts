import { ICreateAssignmentInput } from "./create-assignment.interfaces";

export interface IUpdateAssignmentInput extends Partial<ICreateAssignmentInput> {
  id: number
}
