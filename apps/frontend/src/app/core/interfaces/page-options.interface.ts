export enum Order {
  ASC = "ASC",
  DESC = "DESC",
}

export interface IPageOptions {
  order?: Order
  page?: number
  take?: number
}
