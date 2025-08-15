import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeederSimpleModule } from './seeder-simple.module';
import { User } from '../../modules/users/entities/user.entity';
import { Department } from '../../modules/organizational/departments/entities/department.entity';
import { Position } from '../../modules/organizational/positions/entities/position.entity';
import { UnitType } from '../../modules/organizational/unit-types/entities/unit-type.entity';
import { Unit } from '../../modules/organizational/units/entities/unit.entity';
import { DocumentCategory } from '../../modules/dispatch/document-category/entities/document-category.entity';
import { DocumentType } from '../../modules/dispatch/document-types/entities/document-type.entity';
import { Document } from '../../modules/dispatch/documents/entities/document.entity';
import { WorkflowTemplate } from '../../modules/workflow/workflow-templates/entities/workflow-template.entity';
import { WorkflowStep } from '../../modules/workflow/workflow-steps/entities/workflow-step.entity';
import { WorkflowInstance } from '../../modules/workflow/workflow-instances/entities/workflow-instance.entity';
import { WorkflowActionLog } from '../../modules/workflow/workflow-action-logs/entities/workflow-action-log.entity';
import { Assignment } from '../../modules/organizational/assignments/entities/assignment.entity';
import { UserPosition } from '../../modules/organizational/user-positions/entities/user-position.entity';
import { File } from '../../modules/files/entities/file.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      username: process.env.DB_USERNAME || 'root',
      password: process.env.DB_PASSWORD || '@Giahau2004',
      database: process.env.DB_DATABASE || 'tdmu_dispatch',
      entities: [
        User,
        Department,
        Position,
        UnitType,
        Unit,
        DocumentCategory,
        DocumentType,
        Document,
        WorkflowTemplate,
        WorkflowStep,
        WorkflowInstance,
        WorkflowActionLog,
        Assignment,
        UserPosition,
        File,
      ],
      synchronize: true,
      logging: false,
    }),
    SeederSimpleModule,
  ],
})
export class SeederAppModule {}
