import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../modules/users/entities/user.entity';
import { Department } from '../../modules/organizational/departments/entities/department.entity';
import { Position } from '../../modules/organizational/positions/entities/position.entity';
import { UnitType } from '../../modules/organizational/unit-types/entities/unit-type.entity';
import { Unit } from '../../modules/organizational/units/entities/unit.entity';
import { DocumentCategory } from '../../modules/dispatch/document-category/entities/document-category.entity';
import { DocumentType } from '../../modules/dispatch/document-types/entities/document-type.entity';
import { WorkflowTemplate } from '../../modules/workflow/workflow-templates/entities/workflow-template.entity';
import {
  WorkflowStep,
  StepType,
} from '../../modules/workflow/workflow-steps/entities/workflow-step.entity';
import { Role } from '../../common/enums/role.enums';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SeederService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Department)
    private readonly departmentRepository: Repository<Department>,
    @InjectRepository(Position)
    private readonly positionRepository: Repository<Position>,
    @InjectRepository(UnitType)
    private readonly unitTypeRepository: Repository<UnitType>,
    @InjectRepository(Unit)
    private readonly unitRepository: Repository<Unit>,
    @InjectRepository(DocumentCategory)
    private readonly documentCategoryRepository: Repository<DocumentCategory>,
    @InjectRepository(DocumentType)
    private readonly documentTypeRepository: Repository<DocumentType>,
    @InjectRepository(WorkflowTemplate)
    private readonly workflowTemplateRepository: Repository<WorkflowTemplate>,
    @InjectRepository(WorkflowStep)
    private readonly workflowStepRepository: Repository<WorkflowStep>,
  ) {}

  async checkExistingData(): Promise<boolean> {
    const userCount = await this.userRepository.count();
    const departmentCount = await this.departmentRepository.count();
    const unitCount = await this.unitRepository.count();

    return userCount > 0 || departmentCount > 0 || unitCount > 0;
  }

  async clearAllData(): Promise<void> {
    // Xóa theo thứ tự để tránh lỗi foreign key constraint
    await this.workflowStepRepository.clear();
    await this.workflowTemplateRepository.clear();
    await this.documentTypeRepository.clear();
    await this.documentCategoryRepository.clear();
    await this.unitRepository.clear();
    await this.unitTypeRepository.clear();
    await this.positionRepository.clear();
    await this.departmentRepository.clear();
    await this.userRepository.clear();
  }

  async seed(): Promise<void> {
    console.log('🔧 Tạo dữ liệu mẫu...');

    // 1. Tạo Unit Types
    console.log('📋 Tạo Unit Types...');
    const unitTypes = await this.seedUnitTypes();

    // 2. Tạo Units
    console.log('🏢 Tạo Units...');
    const units = await this.seedUnits(unitTypes);

    // 3. Tạo Departments
    console.log('🏛️ Tạo Departments...');
    const departments = await this.seedDepartments();

    // 4. Tạo Positions
    console.log('👔 Tạo Positions...');
    const positions = await this.seedPositions(departments);

    // 5. Tạo Users
    console.log('👥 Tạo Users...');
    const users = await this.seedUsers(positions);

    // 6. Tạo Document Categories
    console.log('📁 Tạo Document Categories...');
    const documentCategories = await this.seedDocumentCategories();

    // 7. Tạo Document Types
    console.log('📄 Tạo Document Types...');
    await this.seedDocumentTypes(documentCategories);

    // 8. Tạo Workflow Templates
    console.log('🔄 Tạo Workflow Templates...');
    await this.seedWorkflowTemplates(users);

    console.log('✅ Hoàn thành tạo dữ liệu mẫu!');
  }

  private async seedUnitTypes(): Promise<UnitType[]> {
    const unitTypeData = [
      {
        typeName: 'Trường Đại học',
        description: 'Các trường đại học trực thuộc',
      },
      { typeName: 'Khoa', description: 'Các khoa trong trường' },
      { typeName: 'Phòng Ban', description: 'Các phòng ban chức năng' },
      {
        typeName: 'Trung tâm',
        description: 'Các trung tâm nghiên cứu và đào tạo',
      },
      { typeName: 'Viện', description: 'Các viện nghiên cứu' },
    ];

    const unitTypes = this.unitTypeRepository.create(unitTypeData);
    return await this.unitTypeRepository.save(unitTypes);
  }

  private async seedUnits(unitTypes: UnitType[]): Promise<Unit[]> {
    const unitData = [
      {
        unitName: 'Trường Đại học Thủ Dầu Một',
        unitTypeId: unitTypes[0].id,
        email: 'info@tdmu.edu.vn',
        phone: '0274 3846 123',
        establishmentDate: new Date('2009-01-01'),
      },
      {
        unitName: 'Khoa Công nghệ Thông tin',
        unitTypeId: unitTypes[1].id,
        parentUnitId: 1,
        email: 'cntt@tdmu.edu.vn',
        phone: '0274 3846 456',
        establishmentDate: new Date('2009-01-01'),
      },
      {
        unitName: 'Khoa Kinh tế',
        unitTypeId: unitTypes[1].id,
        parentUnitId: 1,
        email: 'kinhte@tdmu.edu.vn',
        phone: '0274 3846 789',
        establishmentDate: new Date('2009-01-01'),
      },
      {
        unitName: 'Phòng Đào tạo',
        unitTypeId: unitTypes[2].id,
        parentUnitId: 1,
        email: 'daotao@tdmu.edu.vn',
        phone: '0274 3846 101',
        establishmentDate: new Date('2009-01-01'),
      },
      {
        unitName: 'Phòng Tài chính - Kế toán',
        unitTypeId: unitTypes[2].id,
        parentUnitId: 1,
        email: 'taichinh@tdmu.edu.vn',
        phone: '0274 3846 102',
        establishmentDate: new Date('2009-01-01'),
      },
    ];

    const units = this.unitRepository.create(unitData);
    return await this.unitRepository.save(units);
  }

  private async seedDepartments(): Promise<Department[]> {
    const departmentData = [
      {
        name: 'Phòng Đào tạo',
        description: 'Quản lý công tác đào tạo và sinh viên',
      },
      {
        name: 'Phòng Tài chính - Kế toán',
        description: 'Quản lý tài chính và kế toán của trường',
      },
      {
        name: 'Phòng Tổ chức - Hành chính',
        description: 'Quản lý nhân sự và hành chính',
      },
      {
        name: 'Phòng Công tác Sinh viên',
        description: 'Quản lý hoạt động sinh viên',
      },
      {
        name: 'Phòng Khoa học Công nghệ',
        description: 'Quản lý nghiên cứu khoa học',
      },
    ];

    const departments = this.departmentRepository.create(departmentData);
    return await this.departmentRepository.save(departments);
  }

  private async seedPositions(departments: Department[]): Promise<Position[]> {
    const positionData = [
      {
        positionName: 'Hiệu trưởng',
        departmentId: departments[0].id,
        maxSlots: 1,
      },
      {
        positionName: 'Phó Hiệu trưởng',
        departmentId: departments[0].id,
        maxSlots: 3,
      },
      {
        positionName: 'Trưởng phòng Đào tạo',
        departmentId: departments[0].id,
        maxSlots: 1,
      },
      {
        positionName: 'Nhân viên Đào tạo',
        departmentId: departments[0].id,
        maxSlots: 5,
      },
      {
        positionName: 'Trưởng phòng Tài chính',
        departmentId: departments[1].id,
        maxSlots: 1,
      },
      {
        positionName: 'Kế toán trưởng',
        departmentId: departments[1].id,
        maxSlots: 1,
      },
      {
        positionName: 'Nhân viên Kế toán',
        departmentId: departments[1].id,
        maxSlots: 3,
      },
      {
        positionName: 'Trưởng phòng Tổ chức',
        departmentId: departments[2].id,
        maxSlots: 1,
      },
      {
        positionName: 'Nhân viên Hành chính',
        departmentId: departments[2].id,
        maxSlots: 4,
      },
    ];

    const positions = this.positionRepository.create(positionData);
    return await this.positionRepository.save(positions);
  }

  private async seedUsers(positions: Position[]): Promise<User[]> {
    const hashedPassword = await bcrypt.hash('123456', 10);

    const userData = [
      {
        email: 'admin@tdmu.edu.vn',
        passwordHash: hashedPassword,
        firstName: 'Admin',
        lastName: 'System',
        isActive: true,
        isFirstLogin: false,
        roles: [Role.SYSTEM_ADMIN],
      },
      {
        email: 'hieutruong@tdmu.edu.vn',
        passwordHash: hashedPassword,
        firstName: 'Nguyễn Văn',
        lastName: 'Hiệu Trưởng',
        isActive: true,
        isFirstLogin: false,
        roles: [Role.UNIVERSITY_LEADER],
      },
      {
        email: 'phohieutruong@tdmu.edu.vn',
        passwordHash: hashedPassword,
        firstName: 'Trần Thị',
        lastName: 'Phó Hiệu Trưởng',
        isActive: true,
        isFirstLogin: false,
        roles: [Role.UNIVERSITY_LEADER],
      },
      {
        email: 'daotao@tdmu.edu.vn',
        passwordHash: hashedPassword,
        firstName: 'Lê Văn',
        lastName: 'Đào Tạo',
        isActive: true,
        isFirstLogin: false,
        roles: [Role.DEPARTMENT_STAFF],
      },
      {
        email: 'taichinh@tdmu.edu.vn',
        passwordHash: hashedPassword,
        firstName: 'Phạm Thị',
        lastName: 'Tài Chính',
        isActive: true,
        isFirstLogin: false,
        roles: [Role.DEPARTMENT_STAFF],
      },
      {
        email: 'user1@tdmu.edu.vn',
        passwordHash: hashedPassword,
        firstName: 'Nguyễn Văn',
        lastName: 'A',
        isActive: true,
        isFirstLogin: true,
        roles: [Role.BASIC_USER],
      },
      {
        email: 'user2@tdmu.edu.vn',
        passwordHash: hashedPassword,
        firstName: 'Trần Thị',
        lastName: 'B',
        isActive: true,
        isFirstLogin: true,
        roles: [Role.BASIC_USER],
      },
    ];

    const users = this.userRepository.create(userData);
    return await this.userRepository.save(users);
  }

  private async seedDocumentCategories(): Promise<DocumentCategory[]> {
    const categoryData = [
      {
        name: 'Văn bản hành chính',
        description: 'Các loại văn bản hành chính thông thường',
      },
      {
        name: 'Văn bản đào tạo',
        description: 'Văn bản liên quan đến công tác đào tạo',
      },
      {
        name: 'Văn bản tài chính',
        description: 'Văn bản liên quan đến tài chính, kế toán',
      },
      {
        name: 'Văn bản nghiên cứu',
        description: 'Văn bản liên quan đến nghiên cứu khoa học',
      },
      {
        name: 'Văn bản sinh viên',
        description: 'Văn bản liên quan đến sinh viên',
      },
    ];

    const categories = this.documentCategoryRepository.create(categoryData);
    return await this.documentCategoryRepository.save(categories);
  }

  private async seedDocumentTypes(
    categories: DocumentCategory[],
  ): Promise<void> {
    const typeData = [
      {
        name: 'Quyết định',
        description: 'Văn bản quyết định của lãnh đạo',
      },
      {
        name: 'Công văn',
        description: 'Văn bản công văn hành chính',
      },
      {
        name: 'Thông báo',
        description: 'Văn bản thông báo',
      },
      {
        name: 'Báo cáo',
        description: 'Văn bản báo cáo',
      },
      {
        name: 'Kế hoạch',
        description: 'Văn bản kế hoạch',
      },
      {
        name: 'Biên bản',
        description: 'Văn bản biên bản họp, làm việc',
      },
      {
        name: 'Hợp đồng',
        description: 'Văn bản hợp đồng',
      },
      {
        name: 'Đơn từ',
        description: 'Các loại đơn từ, đơn đề nghị',
      },
    ];

    const types = this.documentTypeRepository.create(typeData);
    await this.documentTypeRepository.save(types);
  }

  private async seedWorkflowTemplates(users: User[]): Promise<void> {
    const templateData = [
      {
        name: 'Quy trình phê duyệt văn bản thông thường',
        description:
          'Quy trình phê duyệt cho các văn bản hành chính thông thường',
        isActive: true,
        createdByUserId: users[0].id,
      },
      {
        name: 'Quy trình phê duyệt văn bản tài chính',
        description:
          'Quy trình phê duyệt cho các văn bản liên quan đến tài chính',
        isActive: true,
        createdByUserId: users[0].id,
      },
      {
        name: 'Quy trình phê duyệt văn bản đào tạo',
        description:
          'Quy trình phê duyệt cho các văn bản liên quan đến đào tạo',
        isActive: true,
        createdByUserId: users[0].id,
      },
    ];

    const templates = this.workflowTemplateRepository.create(templateData);
    const savedTemplates =
      await this.workflowTemplateRepository.save(templates);

    // Tạo workflow steps cho từng template
    for (const template of savedTemplates) {
      await this.createWorkflowSteps(template, users);
    }
  }

  private async createWorkflowSteps(
    template: WorkflowTemplate,
    users: User[],
  ): Promise<void> {
    const stepsData = [
      {
        templateId: template.id,
        name: 'Giao việc',
        description: 'Bước giao việc cho người thực hiện',
        type: StepType.START,
        assignedRole: Role.DEPARTMENT_STAFF,
        orderNumber: 1,
        isActive: true,
      },
      {
        templateId: template.id,
        name: 'Tạo văn bản',
        description: 'Người được giao việc tạo văn bản',
        type: StepType.TRANSFER,
        assignedRole: Role.CLERK,
        orderNumber: 2,
        isActive: true,
      },
      {
        templateId: template.id,
        name: 'Phê duyệt trưởng phòng',
        description: 'Phê duyệt bởi trưởng phòng ban',
        type: StepType.APPROVAL,
        assignedRole: Role.DEPARTMENT_STAFF,
        orderNumber: 3,
        isActive: true,
      },
      {
        templateId: template.id,
        name: 'Phê duyệt phó hiệu trưởng',
        description: 'Phê duyệt bởi phó hiệu trưởng',
        type: StepType.APPROVAL,
        assignedRole: Role.UNIVERSITY_LEADER,
        orderNumber: 4,
        isActive: true,
      },
      {
        templateId: template.id,
        name: 'Phê duyệt hiệu trưởng',
        description: 'Phê duyệt cuối cùng bởi hiệu trưởng',
        type: StepType.END,
        assignedRole: Role.UNIVERSITY_LEADER,
        orderNumber: 5,
        isActive: true,
      },
    ];

    const steps = this.workflowStepRepository.create(stepsData);
    await this.workflowStepRepository.save(steps);
  }
}
