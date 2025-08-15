import { Resolver, Query } from '@nestjs/graphql';
import { RoleDto } from './dto/role.dto';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from 'src/auth/guards/gql-auth.guard';

@Resolver(() => RoleDto)
@UseGuards(GqlAuthGuard)
export class RolesResolver {
  @Query(() => [RoleDto], { name: 'workflowRoles', description: 'Lấy danh sách các vai trò có thể gán cho workflow step' })
  getRoles() {
    return [
      { value: 'SYSTEM_ADMIN', label: 'Quản trị viên hệ thống' },
      { value: 'UNIVERSITY_LEADER', label: 'Lãnh đạo cấp cao' },
      { value: 'DEPARTMENT_HEAD', label: 'Trưởng đơn vị' },
      { value: 'DEPARTMENT_STAFF', label: 'Chuyên viên/Nhân viên' },
      { value: 'CLERK', label: 'Văn thư' },
      { value: 'DEGREE_MANAGER', label: 'Quản lý văn bằng' },
      { value: 'BASIC_USER', label: 'Người dùng cơ bản' }
    ];
  }
}
