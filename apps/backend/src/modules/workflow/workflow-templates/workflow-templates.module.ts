import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkflowTemplatesService } from './workflow-templates.service';
import { WorkflowTemplatesResolver } from './workflow-templates.resolver';
import { WorkflowTemplate } from './entities/workflow-template.entity';

@Module({
  imports: [TypeOrmModule.forFeature([WorkflowTemplate])],
  providers: [WorkflowTemplatesResolver, WorkflowTemplatesService],
  exports: [WorkflowTemplatesService]
})
export class WorkflowTemplatesModule {}
