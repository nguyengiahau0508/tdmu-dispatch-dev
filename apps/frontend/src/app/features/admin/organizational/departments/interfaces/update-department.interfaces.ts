export interface IUpdateDepartmentInput {
  id: number;
  name?: string;
  description?: string;
  parentDepartmentId?: number;
}
