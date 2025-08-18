import { Resolver, Query, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../../auth/guards/gql-auth.guard';
import { CurrentUser } from '../../common/decorators/user.decorator';
import { User } from '../../modules/users/entities/user.entity';
import { WorkflowDetailService } from './services/workflow-detail.service';
import { GetDocumentWorkflowInput } from './dto/get-document-workflow/get-document-workflow.input';
import { GetDocumentWorkflowResponse } from './dto/get-document-workflow/get-document-workflow.response';

@Resolver()
@UseGuards(GqlAuthGuard)
export class WorkflowDetailResolver {
  constructor(private readonly workflowDetailService: WorkflowDetailService) {}

  @Query(() => GetDocumentWorkflowResponse, { name: 'getDocumentWorkflow' })
  async getDocumentWorkflow(
    @Args('input') input: GetDocumentWorkflowInput,
    @CurrentUser() user: User,
  ): Promise<GetDocumentWorkflowResponse> {
    try {
      const workflowInfo = await this.workflowDetailService.getDocumentWorkflow(input);

      return {
        metadata: {
          statusCode: 200,
          message: 'Lấy thông tin quy trình tài liệu thành công',
          timestamp: new Date().toISOString(),
        },
        data: workflowInfo,
      };
    } catch (error) {
      return {
        metadata: {
          statusCode: 400,
          message: error.message || 'Có lỗi xảy ra khi lấy thông tin quy trình',
          timestamp: new Date().toISOString(),
        },
        data: null as any,
      };
    }
  }
}
