
import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Reflector } from '@nestjs/core';
import { Role } from 'src/common/enums/role.enums';
import { ROLES_KEY } from 'src/common/decorators/roles.decorator';
import { IS_PUBLIC_KEY } from 'src/common/decorators/public.decorator';

@Injectable()
export class GqlAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // ✅ 1. Check @Public()
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    // ✅ 2. Gọi super để kích hoạt JwtStrategy.validate()
    await super.canActivate(context);

    // ✅ 3. Lấy user sau khi super chạy xong
    const request = this.getRequest(context);
    const user = request?.user as { role?: Role };

    // ✅ 4. Nếu không yêu cầu role -> chỉ cần xác thực là đủ
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles || requiredRoles.length === 0) return !!user;

    // ✅ 5. Kiểm tra role
    return !!user?.role && requiredRoles.includes(user.role);
  }

  getRequest(context: ExecutionContext) {
    return GqlExecutionContext.create(context).getContext().req;
  }
}

