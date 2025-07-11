import { IUser } from "./user.interface";

export interface IUnitType {
  id: number;
  typeName: string;
  description: string;
}

export interface IUnit {
  id: number;
  unitName: string;
  unitType: IUnitType | null;
  parentUnit: IUnit | null;
  establishmentDate: Date;
  email: string | null;
  phone: string | null;
  childUnits: IUnit[]
}

export interface IPosition {
  id: number
  positionName: string
}

export interface IAssignment {
  id: number
  user: IUser
  position: IPosition;
  unit: IUnit;
}
