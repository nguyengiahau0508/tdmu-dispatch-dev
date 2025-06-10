// src/app/core/services/error-handler.service.ts
import { Injectable } from '@angular/core';
import { GraphQLResponseError, GraphQLSingleError } from '../../shared/models/graphql-error.model';

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {

  constructor() { }

  /**
   * Trích xuất và định dạng thông tin lỗi từ phản hồi GraphQL.
   * @param error Phản hồi lỗi nhận được từ HttpClient/Apollo.
   * @returns Một đối tượng chứa thông báo lỗi và mã lỗi (nếu có).
   */
  extractGraphQLError(error: GraphQLResponseError): { message: string; code?: string } {
    if (error.graphQLErrors && error.graphQLErrors.length > 0) {
      const firstError: GraphQLSingleError = error.graphQLErrors[0];
      const errorMessage = firstError.message || 'Có lỗi xảy ra từ server.';
      const errorCode = firstError.extensions?.code;

      return { message: errorMessage, code: errorCode };
    } else if (error.networkError) {
      return { message: 'Lỗi kết nối mạng. Vui lòng kiểm tra lại đường truyền của bạn.' };
    } else {
      return { message: error.message || 'Đã xảy ra lỗi không xác định.' };
    }
  }

  /**
   * Kiểm tra một mã lỗi cụ thể.
   * @param error Phản hồi lỗi nhận được.
   * @param targetCode Mã lỗi cần kiểm tra (ví dụ: '00001').
   * @returns true nếu mã lỗi khớp, ngược lại false.
   */
  hasErrorCode(error: GraphQLResponseError, targetCode: string): boolean {
    if (error.graphQLErrors && error.graphQLErrors.length > 0) {
      return error.graphQLErrors.some((err: GraphQLSingleError) => err.extensions?.code === targetCode);
    }
    return false;
  }
}
