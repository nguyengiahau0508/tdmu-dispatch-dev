// Xóa dòng "api-response.dto.ts" hoặc bất kỳ nội dung thừa nào ở dòng đầu tiên nếu có

import { ObjectType, Field, Int } from '@nestjs/graphql'; // <<<< Sửa lại import, thêm Int
import { Metadata } from './metadata.dto'; // Import Metadata

// Type helper cho ClassType (nếu bạn thực sự cần nó tường minh, nhưng thường không cần thiết cho ví dụ này)
// type ClassType<T = any> = new (...args: any[]) => T;

// Hàm factory để tạo một ObjectType chung cho response có phân trang
export function PaginatedResponse<TItem>(TItemClass: new (...args: any[]) => TItem) { // <<<< Thay ClassType bằng kiểu constructor cơ bản
  @ObjectType({ isAbstract: true, description: 'Response chung có phân trang' })
  abstract class PaginatedResponseClass {
    @Field(() => [TItemClass], { nullable: true, description: 'Dữ liệu trả về (danh sách)' })
    data?: TItem[];

    @Field(() => Metadata, { description: 'Thông tin metadata của response' })
    metadata: Metadata;

    @Field(() => Int, { nullable: true, description: 'Tổng số mục (cho phân trang)' }) // <<<< Int đã được import
    totalCount?: number;

    @Field(() => Boolean, { nullable: true, description: 'Còn trang tiếp theo không (cho phân trang)' })
    hasNextPage?: boolean;
  }
  return PaginatedResponseClass;
}

// Hàm factory để tạo một ObjectType chung cho response không phân trang
export function ApiResponse<TData>(TDataClass: new (...args: any[]) => TData) { // <<<< Thay ClassType bằng kiểu constructor cơ bản
  @ObjectType({ isAbstract: true, description: 'Response chung cho một đối tượng đơn lẻ' })
  abstract class ApiResponseClass {
    @Field(() => TDataClass, { nullable: true, description: 'Dữ liệu trả về' })
    data: TData | null | undefined; // Có thể là một object hoặc null

    @Field(() => Metadata, { description: 'Thông tin metadata của response' })
    metadata: Metadata;
  }
  return ApiResponseClass;
}

// Ví dụ Response trả về một đối tượng User
// import { User } from '../../users/entities/user.entity'; // Ví dụ
// @ObjectType()
// export class UserResponse extends ApiResponse(User) {}

// Ví dụ Response trả về một mảng User (có phân trang)
// @ObjectType()
// export class UsersResponse extends PaginatedResponse(User) {}
