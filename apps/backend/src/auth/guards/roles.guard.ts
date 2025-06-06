import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql'; // <<<< THÊM IMPORT NÀY
import { ROLES_KEY } from 'src/common/decorators/roles.decorator'; // Giữ nguyên đường dẫn của bạn
import { Role } from 'src/common/enums/role.enums';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) { }

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>( // <<<< SỬ DỤNG UserRole
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true; // Nếu không có vai trò nào được yêu cầu, cho phép truy cập
    }

    // Lấy request object từ GraphQL context
    const gqlContext = GqlExecutionContext.create(context);
    const request = gqlContext.getContext().req;

    // Kiểm tra xem request và request.user có tồn tại không
    if (!request || !request.user) {
      console.error(
        'RolesGuard: Request hoặc request.user không tồn tại. Đảm bảo JwtAuthGuard (hoặc GqlAuthGuard) chạy trước và thành công.',
      );
      return false;
    }

    // Lấy thông tin người dùng từ request
    // Giả sử entity User của bạn có thuộc tính `role` là một giá trị đơn lẻ từ enum UserRole
    const user = request.user as { role: Role;[key: string]: any }; // Type assertion để TypeScript biết user có thuộc tính 'role'
    // Kiểm tra xem user có thuộc tính 'role' không
    if (user && typeof user.role !== 'undefined') {
      // So sánh vai trò của người dùng với các vai trò được yêu cầu
      return requiredRoles.some((role) => user.role === role);
    } else {
      console.error(
        'RolesGuard: Thuộc tính "role" không tồn tại hoặc không hợp lệ trên user object.',
        user, // Log ra user object để debug
      );
      return false; // Nếu không có thuộc tính 'role', không cho phép
    }
  }
}
