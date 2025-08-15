import {
  ExceptionFilter, // <<<< SỬA Ở ĐÂY
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { GqlArgumentsHost } from '@nestjs/graphql'; // GqlArgumentsHost vẫn cần thiết
import { GraphQLError, GraphQLFormattedError } from 'graphql'; // Import GraphQLFormattedError để có kiểu cho extensions
import { createErrorMetadata } from '../helpers/metadata.helper'; // Import helper của bạn

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  // <<<< SỬA Ở ĐÂY
  catch(exception: unknown, host: ArgumentsHost): any {
    const gqlHost = GqlArgumentsHost.create(host);
    const info = gqlHost.getInfo(); // Kiểm tra xem có phải là context GraphQL không

    // Nếu không phải là GraphQL context (ví dụ, REST API context), bạn có thể chọn bỏ qua hoặc xử lý khác
    // Trong trường hợp này, chúng ta tập trung vào GraphQL
    if (!info) {
      // Nếu bạn muốn filter này cũng xử lý cho REST, bạn cần thêm logic HttpAdapterHost ở đây
      // console.warn('AllExceptionsFilter: Not a GraphQL context. Skipping GraphQL-specific error formatting.');
      // Có thể throw lại exception để filter khác xử lý, hoặc xử lý lỗi HTTP chung
      if (exception instanceof HttpException) {
        throw exception; // Để NestJS xử lý lỗi HTTP mặc định nếu filter này chỉ cho GraphQL
      }
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const path = info?.path;
    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'An internal server error occurred';
    let responseExtensions: GraphQLFormattedError['extensions'] = {}; // Khởi tạo extensions

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const response = exception.getResponse();
      if (typeof response === 'string') {
        message = response;
      } else if (typeof response === 'object' && response !== null) {
        message = (response as any).message || exception.message;
        // Giữ lại các extensions từ HttpException nếu có (ví dụ: lỗi validation của class-validator)
        if ((response as any).error && (response as any).statusCode) {
          responseExtensions = {
            ...responseExtensions,
            originalError: {
              error: (response as any).error,
              statusCode: (response as any).statusCode,
              message: (response as any).message, // message có thể là mảng
            },
          };
        }
      } else {
        message = exception.message;
      }
    } else if (exception instanceof GraphQLError) {
      message = exception.message;
      responseExtensions = { ...exception.extensions }; // Sao chép extensions gốc

      // Cố gắng lấy statusCode từ extensions
      if (typeof responseExtensions?.status === 'number') {
        statusCode = responseExtensions.status;
      } else if (
        typeof (responseExtensions?.http as any)?.status === 'number'
      ) {
        // Kiểm tra an toàn hơn
        statusCode = (responseExtensions.http as any).status;
      } else if (
        responseExtensions?.code === 'BAD_USER_INPUT' ||
        responseExtensions?.code === 'GRAPHQL_VALIDATION_FAILED'
      ) {
        statusCode = HttpStatus.BAD_REQUEST;
      } else if (responseExtensions?.code === 'UNAUTHENTICATED') {
        statusCode = HttpStatus.UNAUTHORIZED;
      } else if (responseExtensions?.code === 'FORBIDDEN') {
        statusCode = HttpStatus.FORBIDDEN;
      }
      // Bạn có thể thêm nhiều mapping từ code sang statusCode ở đây
    } else if (exception instanceof Error) {
      message = exception.message;
      // Có thể log lỗi gốc để debug: console.error(exception);
    }

    const errorMetadata = createErrorMetadata(
      statusCode,
      Array.isArray(message) ? message.join(', ') : message, // Xử lý trường hợp message là mảng
      path ? String(path.key) : undefined, // Lấy tên field gốc gây lỗi
    );

    // Gộp extensions gốc với customMetadata của chúng ta
    // Ưu tiên các giá trị trong errorMetadata nếu có trùng lặp
    const finalExtensions = {
      ...responseExtensions, // Đặt extensions gốc trước
      customMetadata: errorMetadata, // Thêm metadata của chúng ta
      // Ghi đè hoặc thêm code nếu responseExtensions chưa có hoặc muốn chuẩn hóa
      code:
        responseExtensions?.code ||
        (statusCode >= 500 ? 'INTERNAL_SERVER_ERROR' : 'CUSTOM_ERROR'),
    };

    // Tạo một GraphQLError mới với thông tin đã được chuẩn hóa
    const formattedError = new GraphQLError(
      errorMetadata.message || 'An error occurred', // Message chính của lỗi
      {
        nodes: exception instanceof GraphQLError ? exception.nodes : undefined,
        source:
          exception instanceof GraphQLError ? exception.source : undefined,
        positions:
          exception instanceof GraphQLError ? exception.positions : undefined,
        path:
          exception instanceof GraphQLError
            ? exception.path
            : path
              ? [path.key]
              : undefined,
        originalError:
          exception instanceof GraphQLError
            ? exception.originalError
            : exception instanceof Error
              ? exception
              : undefined,
        extensions: finalExtensions,
      },
    );
    return formattedError;
  }
}
