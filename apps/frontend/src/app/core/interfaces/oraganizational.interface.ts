export interface IUnitType {
  id: number;
  typeName: string;
  description: string;
}

export interface IUnit {
  id: number;
  unitName: string;
  unitType: IUnitType;
  parentUnitId: number | null;
  establishmentDate: Date;
  email: string;
  phoneNumber: string;
  childUnits: IUnit[]
}
