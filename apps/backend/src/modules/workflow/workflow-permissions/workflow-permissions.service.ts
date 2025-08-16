import { Injectable } from '@nestjs/common';
import { Role } from 'src/common/enums/role.enums';
import { User } from 'src/modules/users/entities/user.entity';
import { WorkflowStep } from '../workflow-steps/entities/workflow-step.entity';
import { WorkflowInstance } from '../workflow-instances/entities/workflow-instance.entity';
import { ActionType } from '../workflow-action-logs/entities/workflow-action-log.entity';

@Injectable()
export class WorkflowPermissionsService {
  /**
   * Kiểm tra xem user có quyền thực hiện action trên step hiện tại không
   */
  canPerformAction(
    user: User,
    step: WorkflowStep,
    actionType: ActionType,
  ): boolean {
    // Kiểm tra user có role phù hợp với step không
    if (!user.roles.includes(step.assignedRole as Role)) {
      return false;
    }

    // Kiểm tra action type có phù hợp với step type không
    return this.isValidActionForStepType(step.type, actionType);
  }

  /**
   * Kiểm tra xem user có quyền xem workflow instance không
   */
  canViewWorkflow(user: User, instance: WorkflowInstance): boolean {
    // SYSTEM_ADMIN có thể xem tất cả
    if (user.roles.includes(Role.SYSTEM_ADMIN)) {
      return true;
    }

    // Người tạo workflow có thể xem
    if (instance.createdByUserId === user.id) {
      return true;
    }

    // User có role phù hợp với step hiện tại có thể xem
    if (instance.currentStep && user.roles.includes(instance.currentStep.assignedRole as Role)) {
      return true;
    }

    // Kiểm tra xem user có tham gia vào workflow này không (qua action logs)
    const hasParticipated = instance.logs?.some(log => log.actionByUserId === user.id);
    if (hasParticipated) {
      return true;
    }

    return false;
  }

  /**
   * Kiểm tra xem user có quyền tạo workflow instance không
   */
  canCreateWorkflow(user: User, templateId: number): boolean {
    // SYSTEM_ADMIN có thể tạo tất cả
    if (user.roles.includes(Role.SYSTEM_ADMIN)) {
      return true;
    }

    // CLERK có thể tạo workflow cho văn bản
    if (user.roles.includes(Role.CLERK)) {
      return true;
    }

    // DEPARTMENT_STAFF có thể tạo workflow cho văn bản của đơn vị
    if (user.roles.includes(Role.DEPARTMENT_STAFF)) {
      return true;
    }

    return false;
  }

  /**
   * Lấy danh sách workflow instances mà user có thể xử lý
   */
  getActionableWorkflows(user: User, instances: WorkflowInstance[]): WorkflowInstance[] {
    return instances.filter(instance => {
      if (!instance.currentStep) return false;
      
      return user.roles.includes(instance.currentStep.assignedRole as Role);
    });
  }

  /**
   * Lấy danh sách actions có thể thực hiện cho step
   */
  getAvailableActions(step: WorkflowStep): ActionType[] {
    switch (step.type) {
      case 'START':
        return [ActionType.COMPLETE, ActionType.TRANSFER];
      case 'APPROVAL':
        return [ActionType.APPROVE, ActionType.REJECT, ActionType.TRANSFER];
      case 'TRANSFER':
        return [ActionType.COMPLETE, ActionType.TRANSFER];
      case 'END':
        return [ActionType.COMPLETE];
      default:
        return [];
    }
  }

  /**
   * Kiểm tra action type có hợp lệ cho step type không
   */
  private isValidActionForStepType(stepType: string, actionType: ActionType): boolean {
    const availableActions = this.getAvailableActions({ type: stepType } as WorkflowStep);
    return availableActions.includes(actionType);
  }

  /**
   * Lấy role label cho hiển thị
   */
  getRoleLabel(role: string): string {
    const roleLabels = {
      [Role.SYSTEM_ADMIN]: 'Quản trị viên hệ thống',
      [Role.UNIVERSITY_LEADER]: 'Lãnh đạo cấp cao',
      [Role.DEPARTMENT_HEAD]: 'Trưởng đơn vị',
      [Role.DEPARTMENT_STAFF]: 'Chuyên viên/Nhân viên',
      [Role.CLERK]: 'Văn thư',
      [Role.DEGREE_MANAGER]: 'Quản lý văn bằng',
      [Role.BASIC_USER]: 'Người dùng cơ bản',
    };
    return roleLabels[role] || role;
  }

  /**
   * Lấy action type label cho hiển thị
   */
  getActionTypeLabel(actionType: ActionType): string {
    const actionLabels = {
      [ActionType.APPROVE]: 'Phê duyệt',
      [ActionType.REJECT]: 'Từ chối',
      [ActionType.TRANSFER]: 'Chuyển tiếp',
      [ActionType.CANCEL]: 'Hủy bỏ',
      [ActionType.START]: 'Bắt đầu',
      [ActionType.COMPLETE]: 'Hoàn thành',
    };
    return actionLabels[actionType] || actionType;
  }
}
