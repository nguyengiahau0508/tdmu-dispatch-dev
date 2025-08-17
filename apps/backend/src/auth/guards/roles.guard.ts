import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql'; // <<<< THÊM IMPORT NÀY
import { ROLES_KEY } from 'src/common/decorators/roles.decorator'; // Giữ nguyên đường dẫn của bạn
import { Role } from 'src/common/enums/role.enums';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      // <<<< SỬ DỤNG UserRole
      context.getHandler(),
      context.getClass(),
    ]);

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
    const user = request.user as { roles: Role[]; [key: string]: any }; // Type assertion để TypeScript biết user có thuộc tính 'roles'
    
    console.log('🔍 Debug RolesGuard:');
    console.log('  - User ID:', user?.id);
    console.log('  - User email:', user?.email);
    console.log('  - User roles:', user?.roles);
    console.log('  - Required roles:', requiredRoles);
    
    // Kiểm tra xem user có thuộc tính 'roles' không
    if (user && user.roles && Array.isArray(user.roles)) {
      // So sánh vai trò của người dùng với các vai trò được yêu cầu
      const hasRole = user.roles.some((role) => requiredRoles.includes(role));
      console.log('  - Has required role:', hasRole);
      return hasRole;
    } else {
      console.error(
        'RolesGuard: Thuộc tính "roles" không tồn tại hoặc không hợp lệ trên user object.',
        user, // Log ra user object để debug
      );
      return false; // Nếu không có thuộc tính 'roles', không cho phép
    }
  }
}
