import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document } from '../../dispatch/documents/entities/document.entity';
import { WorkflowTemplate } from '../workflow-templates/entities/workflow-template.entity';
import { WorkflowStep } from '../workflow-steps/entities/workflow-step.entity';
import { WorkflowInstance } from '../workflow-instances/entities/workflow-instance.entity';
import { WorkflowActionLog } from '../workflow-action-logs/entities/workflow-action-log.entity';
import { GetDocumentWorkflowInput } from '../dto/get-document-workflow/get-document-workflow.input';
import { DocumentWorkflowInfo, WorkflowStepInfo } from '../dto/get-document-workflow/get-document-workflow.response';

@Injectable()
export class WorkflowDetailService {
  constructor(
    @InjectRepository(Document)
    private readonly documentRepository: Repository<Document>,
    @InjectRepository(WorkflowTemplate)
    private readonly workflowTemplateRepository: Repository<WorkflowTemplate>,
    @InjectRepository(WorkflowStep)
    private readonly workflowStepRepository: Repository<WorkflowStep>,
    @InjectRepository(WorkflowInstance)
    private readonly workflowInstanceRepository: Repository<WorkflowInstance>,
    @InjectRepository(WorkflowActionLog)
    private readonly workflowActionLogRepository: Repository<WorkflowActionLog>,
  ) {}

  async getDocumentWorkflow(input: GetDocumentWorkflowInput): Promise<DocumentWorkflowInfo> {
    // Lấy thông tin tài liệu
    const document = await this.documentRepository.findOne({
      where: { id: input.documentId },
      relations: ['workflowInstance', 'workflowInstance.workflowTemplate'],
    });

    if (!document) {
      throw new Error('Tài liệu không tồn tại');
    }

    if (!document.workflowInstance) {
      throw new Error('Tài liệu chưa được áp dụng quy trình');
    }

    const workflowInstance = document.workflowInstance;
    const workflowTemplate = workflowInstance.template;

    // Lấy các bước trong quy trình
    const workflowSteps = await this.workflowStepRepository.find({
      where: { templateId: workflowTemplate.id },
      order: { orderNumber: 'ASC' },
    });

    // Lấy lịch sử xử lý
    const actionLogs = await this.workflowActionLogRepository.find({
      where: { instanceId: workflowInstance.id },
      order: { createdAt: 'ASC' },
      relations: ['actionByUser'],
    });

    // Tạo thông tin các bước
    const steps: WorkflowStepInfo[] = workflowSteps.map((step, index) => {
      const stepLogs = actionLogs.filter(log => log.stepId === step.id);
      const currentLog = stepLogs[stepLogs.length - 1];

      let status = 'pending';
      let assignedTo: string | undefined;
      let startedAt: Date | undefined;
      let completedAt: Date | undefined;
      let notes: string | undefined;

      if (currentLog) {
        if (currentLog.actionType === 'START') {
          status = 'in_progress';
          assignedTo = currentLog.actionByUser?.fullName;
          startedAt = currentLog.createdAt;
        } else if (currentLog.actionType === 'COMPLETE') {
          status = 'completed';
          assignedTo = currentLog.actionByUser?.fullName;
          startedAt = stepLogs.find(log => log.actionType === 'START')?.createdAt;
          completedAt = currentLog.createdAt;
          notes = currentLog.note;
        } else if (currentLog.actionType === 'CANCEL') {
          status = 'skipped';
          notes = currentLog.note;
        }
      }

      // Xác định bước hiện tại
      if (step.id === workflowInstance.currentStepId) {
        status = 'in_progress';
      }

      return {
        id: step.id,
        name: step.name,
        description: step.description || '',
        order: step.orderNumber,
        status,
        assignedTo,
        startedAt,
        completedAt,
        notes,
        requiredActions: this.getRequiredActions(step),
      };
    });

    // Tính toán thông tin tổng quan
    const completedSteps = steps.filter(step => step.status === 'completed').length;
    const currentStepIndex = workflowInstance.currentStepId 
      ? steps.findIndex(step => step.id === workflowInstance.currentStepId)
      : 0;
    const totalSteps = steps.length;

    // Tạo hướng dẫn xử lý
    const processingGuide = this.generateProcessingGuide(steps, currentStepIndex);

    return {
      documentId: document.id,
      documentTitle: document.title,
      documentType: document.documentType,
      currentStatus: document.status,
      workflowTemplateId: workflowTemplate.id,
      workflowTemplateName: workflowTemplate.name,
      workflowTemplateDescription: workflowTemplate.description || '',
      steps,
      currentStepIndex,
      totalSteps,
      completedSteps,
      createdAt: workflowInstance.createdAt,
      estimatedCompletion: this.calculateEstimatedCompletion(steps, currentStepIndex),
      processingGuide,
    };
  }

  private getRequiredActions(step: WorkflowStep): string[] {
    // Dựa vào loại bước để xác định các hành động cần thiết
    const actions: string[] = [];

    switch (step.type) {
      case 'APPROVAL':
        actions.push('Xem xét toàn bộ nội dung');
        actions.push('Kiểm tra tính phù hợp với quy định');
        actions.push('Phê duyệt hoặc từ chối');
        break;
      case 'TRANSFER':
        actions.push('Xác định đối tượng nhận');
        actions.push('Chuyển tài liệu đến bước tiếp theo');
        actions.push('Xác nhận việc chuyển giao');
        break;
      case 'START':
        actions.push('Bắt đầu quy trình xử lý');
        actions.push('Kiểm tra tính đầy đủ của tài liệu');
        actions.push('Khởi tạo các bước tiếp theo');
        break;
      case 'END':
        actions.push('Hoàn thành quy trình');
        actions.push('Lưu trữ kết quả cuối cùng');
        actions.push('Thông báo hoàn thành');
        break;
      default:
        actions.push('Thực hiện theo hướng dẫn cụ thể');
    }

    return actions;
  }

  private generateProcessingGuide(steps: WorkflowStepInfo[], currentStepIndex: number): string {
    const currentStep = steps[currentStepIndex];
    if (!currentStep) return '';

    let guide = `## Hướng dẫn xử lý bước hiện tại\n\n`;
    guide += `**Bước ${currentStep.order}: ${currentStep.name}**\n\n`;
    guide += `${currentStep.description}\n\n`;

    if (currentStep.requiredActions && currentStep.requiredActions.length > 0) {
      guide += `**Các hành động cần thực hiện:**\n`;
      currentStep.requiredActions.forEach((action, index) => {
        guide += `${index + 1}. ${action}\n`;
      });
      guide += `\n`;
    }

    // Thêm thông tin về các bước tiếp theo
    const nextSteps = steps.slice(currentStepIndex + 1, currentStepIndex + 3);
    if (nextSteps.length > 0) {
      guide += `**Các bước tiếp theo:**\n`;
      nextSteps.forEach((step, index) => {
        guide += `${index + 1}. Bước ${step.order}: ${step.name}\n`;
      });
    }

    return guide;
  }

  private calculateEstimatedCompletion(steps: WorkflowStepInfo[], currentStepIndex: number): Date | undefined {
    // Tính toán thời gian hoàn thành dự kiến
    const remainingSteps = steps.length - currentStepIndex;
    const averageTimePerStep = 2; // 2 ngày trung bình cho mỗi bước
    const estimatedDays = remainingSteps * averageTimePerStep;

    const estimatedDate = new Date();
    estimatedDate.setDate(estimatedDate.getDate() + estimatedDays);
    return estimatedDate;
  }
}
