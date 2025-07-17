import { IUnitType } from "../../../../../core/interfaces/oraganizational.interface"

export interface IUpdateUnitTypeInput {
  id: number
  typeName: string
  description: string
}

export interface IUpdateUnitTypeOuput {
  unitType: IUnitType
}
