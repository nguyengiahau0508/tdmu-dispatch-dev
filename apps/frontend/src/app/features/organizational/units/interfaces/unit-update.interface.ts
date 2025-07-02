export interface IUpdateUnitInput {
  id: number;
  unitName?: string;
  unitTypeId?: number;
  parentUnitId?: number | null;
  establishmentDate?: string;
  email?: string | null;
  phone?: string | null;
} 