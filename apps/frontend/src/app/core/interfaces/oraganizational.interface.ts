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
  departmentId: number
  department: IDepartment
  maxSlots: number
  currentSlotCount:number
  userPositions: IUserPosition[]; // Assuming IUserPosition is defined elsewhere
}

export interface IAssignment {
  id: number
  user: IUser
  position: IPosition;
  unit: IUnit;
}

export interface IDepartment {
  id: number
  name: string
  description: string
  parentDepartmentId?: number
  parentDepartment: IDepartment | null
  children: IDepartment[] 
  positions: IPosition[]
}

export interface IUserPosition {
  id: number;
  userId: number;
  positionId: number;
  user: IUser;
  position: IPosition;
  startDate: string; // ISO date string
  endDate?: string; // ISO date string, optional
}