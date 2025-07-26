import { Module } from '@nestjs/common';
import { WorkflowTemplatesService } from './workflow-templates.service';
import { WorkflowTemplatesResolver } from './workflow-templates.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkflowTemplate } from './entities/workflow-template.entity';

@Module({
  imports: [TypeOrmModule.forFeature([WorkflowTemplate])],
  providers: [WorkflowTemplatesResolver, WorkflowTemplatesService],
})
export class WorkflowTemplatesModule { }
