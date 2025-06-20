import { Metadata } from "./metadata.model";
// TGenericData là kiểu dữ liệu của `data` mà bạn mong đợi
export interface IApiResponse<TGenericData> {
  data: TGenericData | null | undefined; // Dữ liệu trả về có thể là một object, null hoặc undefined
  metadata: Metadata;
}


export interface IPaginatedResponse<TGenericData> {
  data?: TGenericData[]
  metadata: Metadata

  totalCount?: number
  hasNextPage?: boolean
}

// Ví dụ về cách sử dụng:
// import { User } from '../../core/models/user.interface'; // Giả sử bạn có User interface
// type UserApiResponse = ApiResponse<User>; // Response khi lấy thông tin một User cụ thể
