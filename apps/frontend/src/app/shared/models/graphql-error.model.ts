export interface GraphQLErrorLocation {
  line: number;
  column: number;
}

export interface GraphQLErrorExtensions {
  metadata?: {
    statusCode: number;
    message: string;
    timestamp: string;
    // Thêm các trường metadata khác nếu có
  };
  code?: string; // Mã lỗi tùy chỉnh của bạn, ví dụ '00001'
  status?: number; // Mã trạng thái HTTP
  stacktrace?: string[];
  // Thêm các trường extensions khác nếu có
}

export interface GraphQLSingleError {
  message: string;
  locations?: GraphQLErrorLocation[];
  path?: string[];
  extensions?: GraphQLErrorExtensions;
}

export interface GraphQLResponseError {
  graphQLErrors?: GraphQLSingleError[];
  networkError?: any; // Lỗi mạng (ví dụ: mất kết nối, server không phản hồi)
  message?: string; // Thông báo lỗi chung nếu không phải lỗi GraphQL cụ thể
}
