import { Module } from '@nestjs/common';
import { WorkflowTemplatesService } from './workflow-templates.service';
import { WorkflowTemplatesResolver } from './workflow-templates.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([WorkflowTemplatesModule])],
  providers: [WorkflowTemplatesResolver, WorkflowTemplatesService],
})
export class WorkflowTemplatesModule {}
