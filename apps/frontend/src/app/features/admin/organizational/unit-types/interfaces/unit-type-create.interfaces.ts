import { IUnitType } from "../../../../../core/interfaces/oraganizational.interface";

export interface ICreateUnitTypeInput {
  typeName: string;
  description: string;
}

export interface ICreateUnitTypeOuput {
  unitType: IUnitType
}
