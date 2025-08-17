import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Reflector } from '@nestjs/core';
import { Role } from 'src/common/enums/role.enums';
import { ROLES_KEY } from 'src/common/decorators/roles.decorator';
import { IS_PUBLIC_KEY } from 'src/common/decorators/public.decorator';
import { User } from 'src/modules/users/entities/user.entity';

@Injectable()
export class GqlAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // ✅ 1. Cho phép @Public()
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    // ✅ 2. Xác thực JWT
    const can = await super.canActivate(context);
    if (!can) return false;
    // ✅ 3. Lấy user
    const request = this.getRequest(context);
    const user: User = request?.user;

    if (!user.isActive) return false;

    // ✅ 4. Nếu không yêu cầu role -> chỉ cần JWT đúng là ok
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles || requiredRoles.length === 0) return !!user;

    // ✅ 5. Kiểm tra mảng roles
    const userRoles = user?.roles || [];
    console.log('🔍 Debug GqlAuthGuard:');
    console.log('  - User ID:', user?.id);
    console.log('  - User email:', user?.email);
    console.log('  - User roles:', userRoles);
    console.log('  - User roles type:', typeof userRoles);
    console.log('  - Required roles:', requiredRoles);
    
    // Xử lý trường hợp roles có thể là string hoặc array
    let normalizedUserRoles: Role[] = [];
    if (Array.isArray(userRoles)) {
      normalizedUserRoles = userRoles;
    } else if (typeof userRoles === 'string') {
      // Nếu roles là string, chuyển thành array
      normalizedUserRoles = [userRoles as Role];
    }
    
    console.log('  - Normalized user roles:', normalizedUserRoles);
    console.log('  - Required roles type:', typeof requiredRoles);
    console.log('  - Required roles array:', requiredRoles);
    
    const hasRole = normalizedUserRoles.some((role) => {
      const includes = requiredRoles.includes(role);
      console.log(`    - Checking role "${role}" against required roles: ${includes}`);
      return includes;
    });
    console.log('  - Has required role:', hasRole);

    return hasRole;
  }

  getRequest(context: ExecutionContext) {
    return GqlExecutionContext.create(context).getContext().req;
  }
}
