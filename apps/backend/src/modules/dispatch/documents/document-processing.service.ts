import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common'; 
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, ILike, In } from 'typeorm';
import { Document, DocumentTypeEnum, DocumentStatus, DocumentPriority } from './entities/document.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { WorkflowInstancesService } from 'src/modules/workflow/workflow-instances/workflow-instances.service';
import { WorkflowActionLogsService } from 'src/modules/workflow/workflow-action-logs/workflow-action-logs.service';
import { DocumentActionInput } from './dto/document-processing/document-action.input';

@Injectable()
export class DocumentProcessingService {
  constructor(
    @InjectRepository(Document)
    private readonly documentRepository: Repository<Document>,
    private readonly workflowInstancesService: WorkflowInstancesService,
    private readonly workflowActionLogsService: WorkflowActionLogsService,
  ) {}

  /**
   * Lấy danh sách văn bản cần xử lý theo vai trò của user
   */
  async getDocumentsForProcessing(user: User): Promise<Document[]> {
    const userRoles = user.roles;
    
    // Lấy workflow instances mà user có thể xử lý
    const pendingWorkflows = await this.workflowInstancesService.findByCurrentStepAssignee(userRoles[0]); // Sử dụng role đầu tiên
    
    // Lấy document IDs từ workflow instances
    const documentIds = pendingWorkflows.map(workflow => workflow.documentId);
    
    if (documentIds.length === 0) {
      return [];
    }

    // Lấy documents với relations
    return this.documentRepository.find({
      where: { id: In(documentIds) },
      relations: ['documentCategory', 'file', 'createdByUser', 'assignedToUser'],
      order: { 
        priority: 'DESC', // Ưu tiên cao trước
        createdAt: 'ASC'  // Cũ trước
      }
    });
  }

  /**
   * Lấy danh sách văn bản theo trạng thái xử lý
   */
  async getDocumentsByStatus(user: User, status: 'pending' | 'processing' | 'completed' | 'rejected'): Promise<Document[]> {
    const query = this.documentRepository.createQueryBuilder('document')
      .leftJoinAndSelect('document.documentCategory', 'category')
      .leftJoinAndSelect('document.file', 'file')
      .leftJoinAndSelect('document.createdByUser', 'creator')
      .leftJoinAndSelect('document.assignedToUser', 'assignee');

    // Lọc theo trạng thái
    switch (status) {
      case 'pending':
        query.where('document.status IN (:...statuses)', { 
          statuses: [DocumentStatus.DRAFT, DocumentStatus.PENDING] 
        });
        break;
      case 'processing':
        query.where('document.status = :status', { status: DocumentStatus.PROCESSING });
        break;
      case 'completed':
        query.where('document.status IN (:...statuses)', { 
          statuses: [DocumentStatus.APPROVED, DocumentStatus.COMPLETED] 
        });
        break;
      case 'rejected':
        query.where('document.status IN (:...statuses)', { 
          statuses: [DocumentStatus.REJECTED, DocumentStatus.CANCELLED] 
        });
        break;
    }

    // Lọc theo quyền của user
    if (user.roles.includes('SYSTEM_ADMIN' as any)) {
      // Admin có thể xem tất cả
    } else if (user.roles.includes('UNIVERSITY_LEADER' as any)) {
      // Lãnh đạo có thể xem văn bản cấp trường
      query.andWhere('document.documentType IN (:...types)', { 
        types: [DocumentTypeEnum.OUTGOING, DocumentTypeEnum.INTERNAL] 
      });
    } else if (user.roles.includes('DEPARTMENT_STAFF' as any)) {
      // Nhân viên phòng ban chỉ xem văn bản của mình hoặc được giao
      query.andWhere('(document.createdByUserId = :userId OR document.assignedToUserId = :userId)', { 
        userId: user.id 
      });
    } else {
      // BASIC_USER chỉ xem văn bản của mình
      query.andWhere('document.createdByUserId = :userId', { userId: user.id });
    }

    return query
      .orderBy('document.priority', 'DESC')
      .addOrderBy('document.createdAt', 'ASC')
      .getMany();
  }

  /**
   * Lấy thống kê văn bản theo trạng thái
   */
  async getDocumentStatistics(user: User): Promise<{
    pending: number;
    processing: number;
    completed: number;
    rejected: number;
    total: number;
  }> {
    // Lấy documents có thể xử lý (theo workflow)
    const actionableDocuments = await this.getDocumentsForProcessing(user);
    
    // Lấy documents theo trạng thái (cho thống kê tổng quan)
    const [allPending, processing, completed, rejected] = await Promise.all([
      this.getDocumentsByStatus(user, 'pending'),
      this.getDocumentsByStatus(user, 'processing'),
      this.getDocumentsByStatus(user, 'completed'),
      this.getDocumentsByStatus(user, 'rejected'),
    ]);

    return {
      pending: actionableDocuments.length, // Chỉ đếm documents có thể xử lý
      processing: processing.length,
      completed: completed.length,
      rejected: rejected.length,
      total: allPending.length + processing.length + completed.length + rejected.length,
    };
  }

  /**
   * Lấy lịch sử xử lý tài liệu
   */
  async getDocumentProcessingHistory(documentId: number): Promise<any[]> {
    // Tìm document và workflow instance
    const document = await this.documentRepository.findOne({
      where: { id: documentId },
      relations: ['workflowInstance']
    });

    if (!document) {
      throw new NotFoundException(`Document with ID ${documentId} not found`);
    }

    // Nếu có workflow instance, lấy logs từ workflow
    if (document.workflowInstance) {
      const workflowLogs = await this.workflowActionLogsService.findByInstanceId(document.workflowInstance.id);
      
      return workflowLogs.map(log => ({
        id: log.id,
        actionType: log.actionType,
        actionByUser: log.actionByUser,
        actionAt: log.actionAt,
        note: log.note,
        metadata: log.metadata,
        stepName: log.step?.name || 'Unknown Step',
        stepType: log.step?.type || 'Unknown',
        createdAt: log.createdAt
      }));
    }

    // Nếu không có workflow, trả về lịch sử cơ bản từ document
    return [{
      id: 1,
      actionType: 'START',
      actionByUser: document.createdByUser,
      actionAt: document.createdAt,
      note: 'Tài liệu được tạo',
      metadata: null,
      stepName: 'Tạo tài liệu',
      stepType: 'START',
      createdAt: document.createdAt
    }];
  }

  /**
   * Gán văn bản cho user khác xử lý
   */
  async assignDocumentToUser(documentId: number, assignedToUserId: number, assignedByUser: User): Promise<Document> {
    const document = await this.documentRepository.findOne({
      where: { id: documentId },
      relations: ['createdByUser', 'assignedToUser']
    });

    if (!document) {
      throw new NotFoundException(`Document with ID ${documentId} not found`);
    }

    // Kiểm tra quyền gán văn bản
    if (!this.canAssignDocument(assignedByUser, document)) {
      throw new BadRequestException('User does not have permission to assign this document');
    }

    // Cập nhật người được giao
    document.assignedToUserId = assignedToUserId;
    await this.documentRepository.save(document);

    // Log việc gán văn bản
    await this.logDocumentAction(documentId, 'ASSIGN', assignedByUser, `Document assigned to user ${assignedToUserId}`);

    return document;
  }

  /**
   * Kiểm tra quyền gán văn bản
   */
  private canAssignDocument(user: User, document: Document): boolean {
    // SYSTEM_ADMIN có thể gán tất cả văn bản
    if (user.roles.includes('SYSTEM_ADMIN' as any)) {
      return true;
    }

    // UNIVERSITY_LEADER có thể gán văn bản cấp trường
    if (user.roles.includes('UNIVERSITY_LEADER' as any) && 
        document.documentType === DocumentTypeEnum.OUTGOING) {
      return true;
    }

    // DEPARTMENT_STAFF có thể gán văn bản trong phòng ban
    if (user.roles.includes('DEPARTMENT_STAFF' as any) && 
        document.createdByUserId === user.id) {
      return true;
    }

    return false;
  }

  /**
   * Log hành động xử lý văn bản
   */
  private async logDocumentAction(
    documentId: number, 
    actionType: string, 
    user: User, 
    note?: string
  ): Promise<void> {
    // Tìm workflow instance của document
    const workflows = await this.workflowInstancesService.findByDocumentId(documentId);
    
    if (workflows.length > 0) {
      const workflow = workflows[0];
      
      // Log vào workflow action log
      await this.workflowActionLogsService.logAction(
        workflow.id,
        workflow.currentStepId || 0,
        actionType as any,
        user,
        note
      );
    }
  }

  /**
   * Tìm văn bản theo từ khóa và trạng thái
   */
  async searchDocuments(
    user: User,
    searchTerm?: string,
    status?: DocumentStatus,
    documentType?: DocumentTypeEnum,
    priority?: DocumentPriority
  ): Promise<Document[]> {
    const query = this.documentRepository.createQueryBuilder('document')
      .leftJoinAndSelect('document.documentCategory', 'category')
      .leftJoinAndSelect('document.file', 'file')
      .leftJoinAndSelect('document.createdByUser', 'creator')
      .leftJoinAndSelect('document.assignedToUser', 'assignee');

    // Tìm kiếm theo từ khóa
    if (searchTerm) {
      query.andWhere('(document.title LIKE :searchTerm OR document.content LIKE :searchTerm)', {
        searchTerm: `%${searchTerm}%`
      });
    }

    // Lọc theo trạng thái
    if (status) {
      query.andWhere('document.status = :status', { status });
    }

    // Lọc theo loại văn bản
    if (documentType) {
      query.andWhere('document.documentType = :documentType', { documentType });
    }

    // Lọc theo độ ưu tiên
    if (priority) {
      query.andWhere('document.priority = :priority', { priority });
    }

    // Lọc theo quyền của user
    if (!user.roles.includes('SYSTEM_ADMIN' as any)) {
      if (user.roles.includes('UNIVERSITY_LEADER' as any)) {
        query.andWhere('document.documentType IN (:...types)', { 
          types: [DocumentTypeEnum.OUTGOING, DocumentTypeEnum.INTERNAL] 
        });
      } else if (user.roles.includes('DEPARTMENT_STAFF' as any)) {
        query.andWhere('(document.createdByUserId = :userId OR document.assignedToUserId = :userId)', { 
          userId: user.id 
        });
      } else {
        query.andWhere('document.createdByUserId = :userId', { userId: user.id });
      }
    }

    return query
      .orderBy('document.priority', 'DESC')
      .addOrderBy('document.createdAt', 'DESC')
      .getMany();
  }

  /**
   * Lấy danh sách văn bản đã xử lý
   */
  async getProcessedDocuments(user: User): Promise<Document[]> {
    return this.getDocumentsByStatus(user, 'completed');
  }

  /**
   * Lấy danh sách văn bản khẩn cấp (có độ ưu tiên cao)
   */
  async getUrgentDocuments(user: User): Promise<Document[]> {
    const query = this.documentRepository.createQueryBuilder('document')
      .leftJoinAndSelect('document.documentCategory', 'category')
      .leftJoinAndSelect('document.file', 'file')
      .leftJoinAndSelect('document.createdByUser', 'creator')
      .leftJoinAndSelect('document.assignedToUser', 'assignee')
      .where('document.priority IN (:...priorities)', { 
        priorities: [DocumentPriority.HIGH, DocumentPriority.URGENT] 
      });

    // Lọc theo quyền của user
    if (!user.roles.includes('SYSTEM_ADMIN' as any)) {
      if (user.roles.includes('UNIVERSITY_LEADER' as any)) {
        query.andWhere('document.documentType IN (:...types)', { 
          types: [DocumentTypeEnum.OUTGOING, DocumentTypeEnum.INTERNAL] 
        });
      } else if (user.roles.includes('DEPARTMENT_STAFF' as any)) {
        query.andWhere('(document.createdByUserId = :userId OR document.assignedToUserId = :userId)', { 
          userId: user.id 
        });
      } else {
        query.andWhere('document.createdByUserId = :userId', { userId: user.id });
      }
    }

    return query
      .orderBy('document.priority', 'DESC')
      .addOrderBy('document.createdAt', 'ASC')
      .getMany();
  }

  /**
   * Xử lý action trên document
   */
  async processDocumentAction(input: DocumentActionInput, user: User): Promise<Document> {
    const { documentId, actionType, notes, transferToUserId } = input;

    // Tìm document
    const document = await this.documentRepository.findOne({
      where: { id: documentId },
      relations: ['documentCategory', 'file', 'createdByUser', 'assignedToUser', 'workflowInstance']
    });

    if (!document) {
      throw new NotFoundException(`Document with ID ${documentId} not found`);
    }

    // Kiểm tra quyền xử lý
    const canProcess = this.canUserProcessDocument(user, document);
    if (!canProcess) {
      throw new BadRequestException('User does not have permission to process this document');
    }

    // Xử lý theo loại action
    switch (actionType) {
      case 'APPROVE':
        document.status = DocumentStatus.APPROVED;
        break;
      case 'REJECT':
        document.status = DocumentStatus.REJECTED;
        break;
      case 'TRANSFER':
        if (!transferToUserId) {
          throw new BadRequestException('Transfer user ID is required for TRANSFER action');
        }
        document.assignedToUserId = transferToUserId;
        document.status = DocumentStatus.PROCESSING;
        break;
      case 'CANCEL':
        document.status = DocumentStatus.CANCELLED;
        break;
      case 'COMPLETE':
        document.status = DocumentStatus.COMPLETED;
        break;
      default:
        throw new BadRequestException(`Unknown action type: ${actionType}`);
    }

    // Lưu document
    const updatedDocument = await this.documentRepository.save(document);

    // Tạo workflow action log nếu có workflow instance
    if (document.workflowInstance) {
      try {
        await this.workflowActionLogsService.logAction(
          document.workflowInstance.id,
          document.workflowInstance.currentStepId || 1,
          actionType,
          user,
          notes,
          { 
            documentId: document.id,
            documentTitle: document.title,
            actionType: actionType,
            previousStatus: document.status,
            newStatus: updatedDocument.status
          }
        );
      } catch (error) {
        console.error('Error creating workflow action log:', error);
        // Không throw error vì document đã được cập nhật thành công
      }
    }

    return updatedDocument;
  }

  /**
   * Kiểm tra xem user có quyền xử lý document không
   */
  private canUserProcessDocument(user: User, document: Document): boolean {
    const userRoles = user.roles;

    // SYSTEM_ADMIN có thể xử lý tất cả
    if (userRoles.includes('SYSTEM_ADMIN' as any)) {
      return true;
    }

    // UNIVERSITY_LEADER có thể xử lý văn bản cấp trường
    if (userRoles.includes('UNIVERSITY_LEADER' as any)) {
      return document.documentType === DocumentTypeEnum.OUTGOING || 
             document.documentType === DocumentTypeEnum.INTERNAL;
    }

    // DEPARTMENT_HEAD có thể xử lý văn bản trong phạm vi đơn vị
    if (userRoles.includes('DEPARTMENT_HEAD' as any)) {
      return document.documentType === DocumentTypeEnum.INTERNAL;
    }

    // DEPARTMENT_STAFF chỉ có thể xử lý văn bản được giao
    if (userRoles.includes('DEPARTMENT_STAFF' as any)) {
      return document.assignedToUserId === user.id || 
             document.createdByUserId === user.id;
    }

    return false;
  }
}
