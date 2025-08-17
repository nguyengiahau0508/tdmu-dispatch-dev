import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TaskRequest, TaskRequestStatus, TaskPriority } from './entities/task-request.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { Document, DocumentTypeEnum, DocumentStatus, DocumentPriority } from './entities/document.entity';
import { CreateTaskRequestInput } from './dto/create-task-request/create-task-request.input';
import { ApproveTaskRequestInput } from './dto/approve-task-request/approve-task-request.input';
import { RejectTaskRequestInput } from './dto/reject-task-request/reject-task-request.input';
import { TaskRequestStatistics } from './dto/task-request-statistics/task-request-statistics.output';
import { CreateDocumentFromTaskInput } from './dto/create-document-from-task/create-document-from-task.input';
import { CreateDocumentFromTaskOutput } from './dto/create-document-from-task/create-document-from-task.output';
import { Role } from 'src/common/enums/role.enums';
import { MailService } from 'src/integrations/mail/mail.service';

@Injectable()
export class TaskRequestService {
  constructor(
    @InjectRepository(TaskRequest)
    private readonly taskRequestRepository: Repository<TaskRequest>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Document)
    private readonly documentRepository: Repository<Document>,
    private readonly mailService: MailService,
  ) {}

  /**
   * Tạo task request mới
   */
  async createTaskRequest(
    createTaskRequestInput: CreateTaskRequestInput,
    requestedByUser: User,
  ): Promise<TaskRequest> {
    // Kiểm tra người được giao việc tồn tại
    const assignedToUser = await this.userRepository.findOne({
      where: { id: createTaskRequestInput.assignedToUserId }
    });

    if (!assignedToUser) {
      throw new NotFoundException(`User with ID ${createTaskRequestInput.assignedToUserId} not found`);
    }

    // Kiểm tra quyền tạo task request
    if (!this.canCreateTaskRequest(requestedByUser, assignedToUser)) {
      throw new ForbiddenException('You do not have permission to create this task request');
    }

    // Tạo task request
    const taskRequest = this.taskRequestRepository.create({
      requestedByUserId: requestedByUser.id,
      assignedToUserId: createTaskRequestInput.assignedToUserId,
      title: createTaskRequestInput.title,
      description: createTaskRequestInput.description,
      priority: createTaskRequestInput.priority || TaskPriority.MEDIUM,
      deadline: createTaskRequestInput.deadline ? new Date(createTaskRequestInput.deadline) : undefined,
      instructions: createTaskRequestInput.instructions,
      notes: createTaskRequestInput.notes,
      status: TaskRequestStatus.PENDING,
    });

    const savedTaskRequest = await this.taskRequestRepository.save(taskRequest);
    
    // Gửi email thông báo cho người được giao việc
    try {
      await this.mailService.sendTaskAssignmentNotification(
        assignedToUser.email,
        assignedToUser.fullName,
        savedTaskRequest.title,
        requestedByUser.fullName,
        savedTaskRequest.deadline
      );
    } catch (error) {
      console.error('Error sending email notification:', error);
      // Không throw error vì việc gửi email không ảnh hưởng đến việc tạo task
    }
    
    // Load relations để trả về đầy đủ dữ liệu
    return this.getTaskRequestById(savedTaskRequest.id);
  }

  /**
   * Phê duyệt task request
   */
  async approveTaskRequest(
    approveTaskRequestInput: ApproveTaskRequestInput,
    approvedByUser: User,
  ): Promise<TaskRequest> {
    const taskRequest = await this.getTaskRequestById(approveTaskRequestInput.taskRequestId);

    // Kiểm tra quyền phê duyệt
    if (!this.canApproveTaskRequest(approvedByUser, taskRequest)) {
      throw new ForbiddenException('You do not have permission to approve this task request');
    }

    // Kiểm tra trạng thái hiện tại
    if (taskRequest.status !== TaskRequestStatus.PENDING) {
      throw new BadRequestException('Task request is not in PENDING status');
    }

    // Cập nhật trạng thái
    taskRequest.status = TaskRequestStatus.APPROVED;
    taskRequest.approvedAt = new Date();
    taskRequest.notes = approveTaskRequestInput.notes || taskRequest.notes;

    await this.taskRequestRepository.save(taskRequest);
    
    // Load relations để trả về đầy đủ dữ liệu
    return this.getTaskRequestById(taskRequest.id);
  }

  /**
   * Từ chối task request
   */
  async rejectTaskRequest(
    rejectTaskRequestInput: RejectTaskRequestInput,
    rejectedByUser: User,
  ): Promise<TaskRequest> {
    const taskRequest = await this.getTaskRequestById(rejectTaskRequestInput.taskRequestId);

    // Kiểm tra quyền từ chối
    if (!this.canRejectTaskRequest(rejectedByUser, taskRequest)) {
      throw new ForbiddenException('You do not have permission to reject this task request');
    }

    // Kiểm tra trạng thái hiện tại
    if (taskRequest.status !== TaskRequestStatus.PENDING) {
      throw new BadRequestException('Task request is not in PENDING status');
    }

    // Cập nhật trạng thái
    taskRequest.status = TaskRequestStatus.REJECTED;
    taskRequest.rejectedAt = new Date();
    taskRequest.rejectionReason = rejectTaskRequestInput.rejectionReason;

    await this.taskRequestRepository.save(taskRequest);
    
    // Load relations để trả về đầy đủ dữ liệu
    return this.getTaskRequestById(taskRequest.id);
  }

  /**
   * Hủy task request
   */
  async cancelTaskRequest(taskRequestId: number, cancelledByUser: User): Promise<TaskRequest> {
    const taskRequest = await this.getTaskRequestById(taskRequestId);

    // Chỉ người tạo request hoặc SYSTEM_ADMIN mới có thể hủy
    if (taskRequest.requestedByUserId !== cancelledByUser.id && 
        !cancelledByUser.roles.includes(Role.SYSTEM_ADMIN)) {
      throw new ForbiddenException('You do not have permission to cancel this task request');
    }

    // Kiểm tra trạng thái hiện tại
    if (taskRequest.status !== TaskRequestStatus.PENDING) {
      throw new BadRequestException('Task request is not in PENDING status');
    }

    // Cập nhật trạng thái
    taskRequest.status = TaskRequestStatus.CANCELLED;
    taskRequest.cancelledAt = new Date();

    await this.taskRequestRepository.save(taskRequest);
    
    // Load relations để trả về đầy đủ dữ liệu
    return this.getTaskRequestById(taskRequest.id);
  }

  /**
   * Lấy task request theo ID
   */
  async getTaskRequestById(id: number): Promise<TaskRequest> {
    const taskRequest = await this.taskRequestRepository.findOne({
      where: { id },
      relations: ['requestedByUser', 'assignedToUser']
    });

    if (!taskRequest) {
      throw new NotFoundException(`Task request with ID ${id} not found`);
    }

    return taskRequest;
  }

  /**
   * Lấy danh sách task request được giao cho user
   */
  async getTaskRequestsAssignedToUser(userId: number): Promise<TaskRequest[]> {
    return this.taskRequestRepository.find({
      where: { assignedToUserId: userId },
      relations: ['requestedByUser', 'assignedToUser'],
      order: { createdAt: 'DESC' }
    });
  }

  /**
   * Lấy danh sách task request được tạo bởi user
   */
  async getTaskRequestsCreatedByUser(userId: number): Promise<TaskRequest[]> {
    return this.taskRequestRepository.find({
      where: { requestedByUserId: userId },
      relations: ['requestedByUser', 'assignedToUser'],
      order: { createdAt: 'DESC' }
    });
  }

  /**
   * Lấy danh sách task request theo trạng thái
   */
  async getTaskRequestsByStatus(userId: number, status: TaskRequestStatus): Promise<TaskRequest[]> {
    return this.taskRequestRepository.find({
      where: { 
        assignedToUserId: userId,
        status 
      },
      relations: ['requestedByUser', 'assignedToUser'],
      order: { createdAt: 'DESC' }
    });
  }

  /**
   * Lấy thống kê task request
   */
  async getTaskRequestStatistics(userId: number): Promise<TaskRequestStatistics> {
    const taskRequests = await this.getTaskRequestsAssignedToUser(userId);
    
    const statistics = new TaskRequestStatistics();
    statistics.total = taskRequests.length;
    statistics.pending = taskRequests.filter(t => t.status === TaskRequestStatus.PENDING).length;
    statistics.approved = taskRequests.filter(t => t.status === TaskRequestStatus.APPROVED).length;
    statistics.rejected = taskRequests.filter(t => t.status === TaskRequestStatus.REJECTED).length;
    statistics.cancelled = taskRequests.filter(t => t.status === TaskRequestStatus.CANCELLED).length;

    return statistics;
  }

  /**
   * Kiểm tra quyền tạo task request
   */
  private canCreateTaskRequest(requestedByUser: User, assignedToUser: User): boolean {
    // SYSTEM_ADMIN có thể tạo task request cho bất kỳ ai
    if (requestedByUser.roles.includes(Role.SYSTEM_ADMIN)) {
      return true;
    }

    // UNIVERSITY_LEADER có thể tạo task request cho nhân viên phòng ban
    if (requestedByUser.roles.includes(Role.UNIVERSITY_LEADER)) {
      return assignedToUser.roles.includes(Role.DEPARTMENT_STAFF) || 
             assignedToUser.roles.includes(Role.CLERK);
    }

    // DEPARTMENT_STAFF có thể tạo task request cho CLERK
    if (requestedByUser.roles.includes(Role.DEPARTMENT_STAFF)) {
      return assignedToUser.roles.includes(Role.CLERK);
    }

    return false;
  }

  /**
   * Kiểm tra quyền phê duyệt task request
   */
  private canApproveTaskRequest(approvedByUser: User, taskRequest: TaskRequest): boolean {
    // SYSTEM_ADMIN có thể phê duyệt bất kỳ task request nào
    if (approvedByUser.roles.includes(Role.SYSTEM_ADMIN)) {
      return true;
    }

    // Người được giao việc có thể phê duyệt task request của mình
    if (taskRequest.assignedToUserId === approvedByUser.id) {
      return true;
    }

    // UNIVERSITY_LEADER có thể phê duyệt task request cho nhân viên phòng ban
    if (approvedByUser.roles.includes(Role.UNIVERSITY_LEADER)) {
      return true;
    }

    return false;
  }

  /**
   * Kiểm tra quyền từ chối task request
   */
  private canRejectTaskRequest(rejectedByUser: User, taskRequest: TaskRequest): boolean {
    // SYSTEM_ADMIN có thể từ chối bất kỳ task request nào
    if (rejectedByUser.roles.includes(Role.SYSTEM_ADMIN)) {
      return true;
    }

    // Người được giao việc có thể từ chối task request của mình
    if (taskRequest.assignedToUserId === rejectedByUser.id) {
      return true;
    }

    // UNIVERSITY_LEADER có thể từ chối task request cho nhân viên phòng ban
    if (rejectedByUser.roles.includes(Role.UNIVERSITY_LEADER)) {
      return true;
    }

    return false;
  }

  /**
   * Tạo document từ task request
   */
  async createDocumentFromTask(
    input: CreateDocumentFromTaskInput,
    user: User,
  ): Promise<CreateDocumentFromTaskOutput> {
    // Lấy task request
    const taskRequest = await this.getTaskRequestById(input.taskRequestId);

    // Kiểm tra quyền tạo document từ task
    if (taskRequest.assignedToUserId !== user.id && 
        !user.roles.includes(Role.SYSTEM_ADMIN)) {
      throw new ForbiddenException('You do not have permission to create document from this task request');
    }

    // Kiểm tra trạng thái task request
    if (taskRequest.status !== TaskRequestStatus.APPROVED) {
      throw new BadRequestException('Task request must be approved to create document');
    }

    try {
      // Tạo document mới
      const document = this.documentRepository.create({
        title: input.title,
        content: input.content,
        documentType: DocumentTypeEnum.INTERNAL, // Default type
        documentCategoryId: 1, // Default category ID
        priority: input.priority as unknown as DocumentPriority, // Convert TaskPriority to DocumentPriority
        status: DocumentStatus.DRAFT,
        createdByUserId: user.id,
        taskRequestId: taskRequest.id,
      });

      const savedDocument = await this.documentRepository.save(document);

      // TODO: Tạo workflow instance cho document
      // const workflowInstance = await this.workflowService.createWorkflowInstance({
      //   templateId: 1, // Default template
      //   documentId: savedDocument.id,
      //   notes: `Tạo từ task request: ${taskRequest.title}`
      // });

      return {
        documentId: savedDocument.id,
        workflowInstanceId: 0, // TODO: Replace with actual workflow instance ID
        success: true,
        message: 'Document created successfully from task request'
      };
    } catch (error) {
      console.error('Error creating document from task:', error);
      throw new BadRequestException('Failed to create document from task request');
    }
  }
}
