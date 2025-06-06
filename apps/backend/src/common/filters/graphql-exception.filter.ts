
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { GqlArgumentsHost } from '@nestjs/graphql';
import { GraphQLError } from 'graphql';
import { createErrorMetadata } from 'src/common/helpers/metadata.helper';

@Catch(HttpException)
export class GraphQLExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const gqlHost = GqlArgumentsHost.create(host);

    const response = exception.getResponse();
    const status = exception.getStatus?.() ?? HttpStatus.INTERNAL_SERVER_ERROR;

    // Xử lý message
    let message: string;
    if (typeof response === 'string') {
      message = response;
    } else if (Array.isArray((response as any).message)) {
      message = (response as any).message.join(', ');
    } else {
      message = (response as any).message || exception.message || 'Internal server error';
    }

    // Mã lỗi tuỳ chỉnh nếu có
    const customCode = (response as any).code || 'UNKNOWN_ERROR';

    throw new GraphQLError(message, {
      extensions: {
        metadata: createErrorMetadata(status, message), // sử dụng helper metadata chuẩn
        code: customCode, // mã lỗi nội bộ của hệ thống
        status,
      },
    });
  }
}

