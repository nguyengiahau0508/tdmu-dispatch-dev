import { Module, forwardRef } from '@nestjs/common';
import { WorkflowPermissionsService } from './workflow-permissions.service';
import { WorkflowPermissionsResolver } from './workflow-permissions.resolver';
import { WorkflowInstancesModule } from '../workflow-instances/workflow-instances.module';
import { WorkflowStepsModule } from '../workflow-steps/workflow-steps.module';

@Module({
  imports: [
    forwardRef(() => WorkflowInstancesModule), 
    forwardRef(() => WorkflowStepsModule)
  ],
  providers: [WorkflowPermissionsService, WorkflowPermissionsResolver],
  exports: [WorkflowPermissionsService],
})
export class WorkflowPermissionsModule {}
