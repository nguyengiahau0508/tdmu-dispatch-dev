import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { TaskAssignment, TaskStatus } from './entities/task-assignment.entity';
import { Document, DocumentStatus } from './entities/document.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { AssignTaskInput } from './dto/assign-task/assign-task.input';
import { Role } from 'src/common/enums/role.enums';

@Injectable()
export class TaskAssignmentService {
  constructor(
    @InjectRepository(TaskAssignment)
    private readonly taskAssignmentRepository: Repository<TaskAssignment>,
    @InjectRepository(Document)
    private readonly documentRepository: Repository<Document>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * Giao việc cho người dùng
   */
  async assignTask(assignTaskInput: AssignTaskInput, assignedByUser: User): Promise<TaskAssignment> {
    // Kiểm tra document tồn tại
    const document = await this.documentRepository.findOne({
      where: { id: assignTaskInput.documentId },
      relations: ['createdByUser', 'assignedToUser']
    });

    if (!document) {
      throw new NotFoundException(`Document with ID ${assignTaskInput.documentId} not found`);
    }

    // Kiểm tra người được giao việc tồn tại
    const assignedToUser = await this.userRepository.findOne({
      where: { id: assignTaskInput.assignedToUserId }
    });

    if (!assignedToUser) {
      throw new NotFoundException(`User with ID ${assignTaskInput.assignedToUserId} not found`);
    }

    // Kiểm tra quyền giao việc
    if (!this.canAssignTask(assignedByUser, document, assignedToUser)) {
      throw new ForbiddenException('You do not have permission to assign this task');
    }

    // Tạo task assignment
    const taskAssignment = this.taskAssignmentRepository.create({
      documentId: assignTaskInput.documentId,
      assignedToUserId: assignTaskInput.assignedToUserId,
      assignedByUserId: assignedByUser.id,
      taskDescription: assignTaskInput.taskDescription,
      deadline: assignTaskInput.deadline ? new Date(assignTaskInput.deadline) : undefined,
      instructions: assignTaskInput.instructions,
      notes: assignTaskInput.notes,
      status: TaskStatus.PENDING,
    });

    // Lưu task assignment
    const savedTask = await this.taskAssignmentRepository.save(taskAssignment);

    // Cập nhật document status nếu cần
    if (document.status === DocumentStatus.DRAFT) {
      document.status = DocumentStatus.PENDING;
      await this.documentRepository.save(document);
    }

    return savedTask;
  }

  /**
   * Lấy danh sách task được giao cho user
   */
  async getTasksAssignedToUser(userId: number): Promise<TaskAssignment[]> {
    return this.taskAssignmentRepository.find({
      where: { assignedToUserId: userId },
      relations: ['document', 'assignedByUser', 'assignedToUser'],
      order: { assignedAt: 'DESC' }
    });
  }

  /**
   * Lấy danh sách task được giao bởi user
   */
  async getTasksAssignedByUser(userId: number): Promise<TaskAssignment[]> {
    return this.taskAssignmentRepository.find({
      where: { assignedByUserId: userId },
      relations: ['document', 'assignedByUser', 'assignedToUser'],
      order: { assignedAt: 'DESC' }
    });
  }

  /**
   * Lấy task assignment theo ID
   */
  async getTaskAssignmentById(id: number): Promise<TaskAssignment> {
    const task = await this.taskAssignmentRepository.findOne({
      where: { id },
      relations: ['document', 'assignedByUser', 'assignedToUser']
    });

    if (!task) {
      throw new NotFoundException(`Task assignment with ID ${id} not found`);
    }

    return task;
  }

  /**
   * Cập nhật trạng thái task
   */
  async updateTaskStatus(taskId: number, status: TaskStatus, userId: number): Promise<TaskAssignment> {
    const task = await this.getTaskAssignmentById(taskId);

    // Kiểm tra quyền cập nhật
    if (task.assignedToUserId !== userId && !this.isManager(userId)) {
      throw new ForbiddenException('You do not have permission to update this task');
    }

    task.status = status;
    
    if (status === TaskStatus.COMPLETED) {
      task.completedAt = new Date();
    }

    return this.taskAssignmentRepository.save(task);
  }

  /**
   * Lấy danh sách task theo trạng thái
   */
  async getTasksByStatus(userId: number, status: TaskStatus): Promise<TaskAssignment[]> {
    return this.taskAssignmentRepository.find({
      where: { 
        assignedToUserId: userId,
        status 
      },
      relations: ['document', 'assignedByUser', 'assignedToUser'],
      order: { assignedAt: 'DESC' }
    });
  }

  /**
   * Lấy thống kê task
   */
  async getTaskStatistics(userId: number): Promise<{
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
    cancelled: number;
  }> {
    const tasks = await this.getTasksAssignedToUser(userId);
    
    return {
      total: tasks.length,
      pending: tasks.filter(t => t.status === TaskStatus.PENDING).length,
      inProgress: tasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length,
      completed: tasks.filter(t => t.status === TaskStatus.COMPLETED).length,
      cancelled: tasks.filter(t => t.status === TaskStatus.CANCELLED).length,
    };
  }

  /**
   * Kiểm tra quyền giao việc
   */
  private canAssignTask(assignedByUser: User, document: Document, assignedToUser: User): boolean {
    // SYSTEM_ADMIN có thể giao việc cho bất kỳ ai
    if (assignedByUser.roles.includes(Role.SYSTEM_ADMIN)) {
      return true;
    }

    // UNIVERSITY_LEADER có thể giao việc cho nhân viên phòng ban
    if (assignedByUser.roles.includes(Role.UNIVERSITY_LEADER)) {
      return assignedToUser.roles.includes(Role.DEPARTMENT_STAFF) || 
             assignedToUser.roles.includes(Role.CLERK);
    }

    // DEPARTMENT_STAFF có thể giao việc cho CLERK trong cùng phòng ban
    if (assignedByUser.roles.includes(Role.DEPARTMENT_STAFF)) {
      return assignedToUser.roles.includes(Role.CLERK);
    }

    // Người tạo document có thể giao việc
    if (document.createdByUserId === assignedByUser.id) {
      return true;
    }

    return false;
  }

  /**
   * Kiểm tra xem user có phải là manager không
   */
  private isManager(userId: number): boolean {
    // Logic kiểm tra manager - có thể mở rộng sau
    return true; // Tạm thời cho phép tất cả
  }

  /**
   * Hủy task assignment
   */
  async cancelTask(taskId: number, userId: number): Promise<TaskAssignment> {
    const task = await this.getTaskAssignmentById(taskId);

    // Chỉ người giao việc hoặc SYSTEM_ADMIN mới có thể hủy
    if (task.assignedByUserId !== userId && !this.isManager(userId)) {
      throw new ForbiddenException('You do not have permission to cancel this task');
    }

    task.status = TaskStatus.CANCELLED;
    return this.taskAssignmentRepository.save(task);
  }

  /**
   * Tìm kiếm task
   */
  async searchTasks(
    userId: number,
    searchTerm?: string,
    status?: TaskStatus,
    assignedByUserId?: number
  ): Promise<TaskAssignment[]> {
    const query = this.taskAssignmentRepository.createQueryBuilder('task')
      .leftJoinAndSelect('task.document', 'document')
      .leftJoinAndSelect('task.assignedByUser', 'assignedByUser')
      .leftJoinAndSelect('task.assignedToUser', 'assignedToUser')
      .where('task.assignedToUserId = :userId', { userId });

    if (searchTerm) {
      query.andWhere('(task.taskDescription LIKE :searchTerm OR document.title LIKE :searchTerm)', {
        searchTerm: `%${searchTerm}%`
      });
    }

    if (status) {
      query.andWhere('task.status = :status', { status });
    }

    if (assignedByUserId) {
      query.andWhere('task.assignedByUserId = :assignedByUserId', { assignedByUserId });
    }

    return query.orderBy('task.assignedAt', 'DESC').getMany();
  }
}
