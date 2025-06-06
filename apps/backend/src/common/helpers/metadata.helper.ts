import { HttpStatus } from '@nestjs/common'; // Import HttpStatus nếu bạn muốn dùng các hằng số mã trạng thái
import { Metadata } from '../graphql/metadata.dto'; // Đường dẫn đến Metadata DTO của bạn

/**
 * Tạo một đối tượng Metadata chuẩn.
 * @param statusCode Mã trạng thái (nên dùng từ HttpStatus enum).
 * @param message Thông báo tùy chọn.
 * @param path Đường dẫn request tùy chọn.
 * @returns Đối tượng Metadata.
 */
export function createResponseMetadata(
  statusCode: number,
  message?: string,
  path?: string,
): Metadata {
  return {
    statusCode,
    message: message || getDefaultMessage(statusCode), // Thêm thông báo mặc định nếu không có message
    timestamp: new Date().toISOString(),
    path,
  };
}

/**
 * Hàm helper để lấy thông báo mặc định dựa trên statusCode.
 * @param statusCode Mã trạng thái.
 * @returns Thông báo mặc định.
 */
function getDefaultMessage(statusCode: number): string {
  if (statusCode >= 200 && statusCode < 300) {
    return 'Request processed successfully.';
  }
  if (statusCode === HttpStatus.CREATED) {
    return 'Resource created successfully.';
  }
  if (statusCode === HttpStatus.NOT_FOUND) {
    return 'Resource not found.';
  }
  if (statusCode === HttpStatus.BAD_REQUEST) {
    return 'Bad request. Please check your input.';
  }
  if (statusCode === HttpStatus.UNAUTHORIZED) {
    return 'Unauthorized. Authentication is required.';
  }
  if (statusCode === HttpStatus.FORBIDDEN) {
    return 'Forbidden. You do not have permission to access this resource.';
  }
  if (statusCode >= 500) {
    return 'An internal server error occurred.';
  }
  return 'Request processed.'; // Thông báo chung chung
}

// Bạn cũng có thể tạo các hàm helper cụ thể hơn nếu muốn
/**
 * Tạo Metadata cho response thành công (2xx).
 * @param message Thông báo thành công tùy chọn.
 * @param path Đường dẫn request tùy chọn.
 * @param statusCode Mã trạng thái thành công cụ thể (mặc định là HttpStatus.OK).
 * @returns Đối tượng Metadata.
 */
export function createSuccessMetadata(
  message?: string,
  path?: string,
  statusCode: number = HttpStatus.OK,
): Metadata {
  return createResponseMetadata(statusCode, message, path);
}

/**
 * Tạo Metadata cho response lỗi.
 * @param statusCode Mã trạng thái lỗi (nên dùng từ HttpStatus enum).
 * @param message Thông báo lỗi.
 * @param path Đường dẫn request tùy chọn.
 * @returns Đối tượng Metadata.
 */
export function createErrorMetadata(
  statusCode: number,
  message: string,
  path?: string,
): Metadata {
  // Đảm bảo statusCode là lỗi
  const finalStatusCode = statusCode < 400 ? HttpStatus.INTERNAL_SERVER_ERROR : statusCode;
  return createResponseMetadata(finalStatusCode, message, path);
}
