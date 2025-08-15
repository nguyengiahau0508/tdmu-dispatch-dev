import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeederService } from './seeder.service';
import { User } from '../../modules/users/entities/user.entity';
import { Department } from '../../modules/organizational/departments/entities/department.entity';
import { Position } from '../../modules/organizational/positions/entities/position.entity';
import { UnitType } from '../../modules/organizational/unit-types/entities/unit-type.entity';
import { Unit } from '../../modules/organizational/units/entities/unit.entity';
import { DocumentCategory } from '../../modules/dispatch/document-category/entities/document-category.entity';
import { DocumentType } from '../../modules/dispatch/document-types/entities/document-type.entity';
import { WorkflowTemplate } from '../../modules/workflow/workflow-templates/entities/workflow-template.entity';
import { WorkflowStep } from '../../modules/workflow/workflow-steps/entities/workflow-step.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Department,
      Position,
      UnitType,
      Unit,
      DocumentCategory,
      DocumentType,
      WorkflowTemplate,
      WorkflowStep,
    ]),
  ],
  providers: [SeederService],
  exports: [SeederService],
})
export class SeederModule {}
