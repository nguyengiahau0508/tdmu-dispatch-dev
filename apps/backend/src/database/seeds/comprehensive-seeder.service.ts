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
import { Document, DocumentTypeEnum, DocumentStatus, DocumentPriority } from '../../modules/dispatch/documents/entities/document.entity';
import { WorkflowTemplate } from '../../modules/workflow/workflow-templates/entities/workflow-template.entity';
import { WorkflowStep, StepType } from '../../modules/workflow/workflow-steps/entities/workflow-step.entity';
import { WorkflowInstance, WorkflowStatus } from '../../modules/workflow/workflow-instances/entities/workflow-instance.entity';
import { WorkflowActionLog, ActionType } from '../../modules/workflow/workflow-action-logs/entities/workflow-action-log.entity';
import { Assignment } from '../../modules/organizational/assignments/entities/assignment.entity';
import { UserPosition } from '../../modules/organizational/user-positions/entities/user-position.entity';
import { File } from '../../modules/files/entities/file.entity';
import { Role } from '../../common/enums/role.enums';
import * as bcrypt from 'bcrypt';

@Injectable()
export class ComprehensiveSeederService {
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
    @InjectRepository(Assignment)
    private readonly assignmentRepository: Repository<Assignment>,
    @InjectRepository(UserPosition)
    private readonly userPositionRepository: Repository<UserPosition>,
    @InjectRepository(File)
    private readonly fileRepository: Repository<File>,
  ) {}

  async checkExistingData(): Promise<boolean> {
    const userCount = await this.userRepository.count();
    const departmentCount = await this.departmentRepository.count();
    const unitCount = await this.unitRepository.count();
    const documentCount = await this.documentRepository.count();
    
    return userCount > 0 || departmentCount > 0 || unitCount > 0 || documentCount > 0;
  }

  async clearAllData(): Promise<void> {
    console.log('🗑️ Xóa tất cả dữ liệu hiện có...');
    
    const queryRunner = this.workflowActionLogRepository.manager.connection.createQueryRunner();
    
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();
      
      // Tắt foreign key checks
      await queryRunner.query('SET FOREIGN_KEY_CHECKS = 0');
      
      // Xóa tất cả dữ liệu từ các bảng theo thứ tự
      const tables = [
        'workflow_action_log',
        'workflow_instance', 
        'workflow_step',
        'workflow_template',
        'assignment',
        'user_position',
        'document',
        'document_type',
        'document_category',
        'unit',
        'unit_type',
        'position',
        'department',
        'file',
        'user'
      ];
      
      for (const table of tables) {
        await queryRunner.query(`DELETE FROM \`${table}\``);
        // Reset auto increment
        await queryRunner.query(`ALTER TABLE \`${table}\` AUTO_INCREMENT = 1`);
      }
      
      // Bật lại foreign key checks
      await queryRunner.query('SET FOREIGN_KEY_CHECKS = 1');
      
      await queryRunner.commitTransaction();
      console.log('✅ Đã xóa tất cả dữ liệu thành công!');
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async seed(): Promise<void> {
    console.log('🔧 Bắt đầu tạo dữ liệu mẫu đầy đủ...');

    // 1. Tạo Unit Types
    console.log('📋 1. Tạo Unit Types...');
    const unitTypes = await this.seedUnitTypes();

    // 2. Tạo Units
    console.log('🏢 2. Tạo Units...');
    const units = await this.seedUnits(unitTypes);

    // 3. Tạo Departments
    console.log('🏛️ 3. Tạo Departments...');
    const departments = await this.seedDepartments();

    // 4. Tạo Positions
    console.log('👔 4. Tạo Positions...');
    const positions = await this.seedPositions(departments);

    // 5. Tạo Users với đầy đủ roles
    console.log('👥 5. Tạo Users...');
    const users = await this.seedUsers(positions);

    // 6. Tạo Files
    console.log('📁 6. Tạo Files...');
    const files = await this.seedFiles(users);

    // 7. Tạo Document Categories
    console.log('📁 7. Tạo Document Categories...');
    const documentCategories = await this.seedDocumentCategories();

    // 8. Tạo Document Types
    console.log('📄 8. Tạo Document Types...');
    const documentTypes = await this.seedDocumentTypes(documentCategories);

    // 9. Tạo User Positions
    console.log('👤 9. Tạo User Positions...');
    await this.seedUserPositions(users, positions);

    // 10. Tạo Assignments
    console.log('📋 10. Tạo Assignments...');
    await this.seedAssignments(users, positions, units);

    // 11. Tạo Workflow Templates với đầy đủ steps
    console.log('🔄 11. Tạo Workflow Templates...');
    const templates = await this.seedWorkflowTemplates(users);

    // 12. Tạo Documents với đầy đủ trạng thái
    console.log('📄 12. Tạo Documents...');
    const documents = await this.seedDocuments(documentCategories, documentTypes, files, users);

    // 13. Tạo Workflow Instances cho documents
    console.log('🔄 13. Tạo Workflow Instances...');
    const instances = await this.seedWorkflowInstances(templates, documents, users);

    // 14. Tạo Workflow Action Logs đầy đủ
    console.log('📝 14. Tạo Workflow Action Logs...');
    await this.seedWorkflowActionLogs(instances, users);

    console.log('✅ Hoàn thành tạo dữ liệu mẫu đầy đủ!');
    console.log('\n📊 Thống kê dữ liệu đã tạo:');
    console.log(`- Users: ${users.length}`);
    console.log(`- Departments: ${departments.length}`);
    console.log(`- Units: ${units.length}`);
    console.log(`- Documents: ${documents.length}`);
    console.log(`- Workflow Templates: ${templates.length}`);
    console.log(`- Workflow Instances: ${instances.length}`);
  }

  private async seedUnitTypes(): Promise<UnitType[]> {
    const unitTypeData = [
      { typeName: 'Trường Đại học', description: 'Các trường đại học trực thuộc' },
      { typeName: 'Khoa', description: 'Các khoa trong trường' },
      { typeName: 'Phòng Ban', description: 'Các phòng ban chức năng' },
      { typeName: 'Trung tâm', description: 'Các trung tâm nghiên cứu và đào tạo' },
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
        email: 'cntt@tdmu.edu.vn',
        phone: '0274 3846 124',
        establishmentDate: new Date('2010-01-01'),
      },
      {
        unitName: 'Khoa Kinh tế',
        unitTypeId: unitTypes[1].id,
        email: 'kt@tdmu.edu.vn',
        phone: '0274 3846 125',
        establishmentDate: new Date('2010-01-01'),
      },
      {
        unitName: 'Phòng Đào tạo',
        unitTypeId: unitTypes[2].id,
        email: 'daotao@tdmu.edu.vn',
        phone: '0274 3846 126',
        establishmentDate: new Date('2009-01-01'),
      },
      {
        unitName: 'Phòng Tài chính - Kế toán',
        unitTypeId: unitTypes[2].id,
        email: 'taichinh@tdmu.edu.vn',
        phone: '0274 3846 127',
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
        description: 'Phòng quản lý đào tạo',
        email: 'daotao@tdmu.edu.vn',
        phone: '0274 3846 126',
      },
      {
        name: 'Phòng Tài chính - Kế toán',
        description: 'Phòng quản lý tài chính',
        email: 'taichinh@tdmu.edu.vn',
        phone: '0274 3846 127',
      },
      {
        name: 'Phòng Tổ chức - Hành chính',
        description: 'Phòng quản lý nhân sự và hành chính',
        email: 'tochuc@tdmu.edu.vn',
        phone: '0274 3846 129',
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
        maxSlots: 2,
      },
      {
        positionName: 'Trưởng phòng',
        departmentId: departments[1].id,
        maxSlots: 3,
      },
      {
        positionName: 'Nhân viên',
        departmentId: departments[2].id,
        maxSlots: 10,
      },
      {
        positionName: 'Giảng viên',
        departmentId: departments[0].id,
        maxSlots: 20,
      },
    ];

    const positions = this.positionRepository.create(positionData);
    return await this.positionRepository.save(positions);
  }

  private async seedUsers(positions: Position[]): Promise<User[]> {
    const hashedPassword = await bcrypt.hash('password123', 10);

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
        roles: [Role.SYSTEM_ADMIN],
      },
      {
        email: 'phohieutruong@tdmu.edu.vn',
        passwordHash: hashedPassword,
        firstName: 'Trần Thị',
        lastName: 'Phó Hiệu Trưởng',
        isActive: true,
        isFirstLogin: false,
        roles: [Role.SYSTEM_ADMIN],
      },
      {
        email: 'truongphong@tdmu.edu.vn',
        passwordHash: hashedPassword,
        firstName: 'Lê Văn',
        lastName: 'Trưởng Phòng',
        isActive: true,
        isFirstLogin: false,
        roles: [Role.DEPARTMENT_STAFF],
      },
      {
        email: 'nhanvien1@tdmu.edu.vn',
        passwordHash: hashedPassword,
        firstName: 'Phạm Thị',
        lastName: 'Nhân Viên 1',
        isActive: true,
        isFirstLogin: false,
        roles: [Role.DEPARTMENT_STAFF],
      },
      {
        email: 'giangvien1@tdmu.edu.vn',
        passwordHash: hashedPassword,
        firstName: 'Vũ Thị',
        lastName: 'Giảng Viên 1',
        isActive: true,
        isFirstLogin: false,
        roles: [Role.CLERK],
      },
      {
        email: 'thuky1@tdmu.edu.vn',
        passwordHash: hashedPassword,
        firstName: 'Ngô Thị',
        lastName: 'Thư Ký 1',
        isActive: true,
        isFirstLogin: false,
        roles: [Role.CLERK],
      },
    ];

    const users = this.userRepository.create(userData);
    return await this.userRepository.save(users);
  }

  private async seedFiles(users: User[]): Promise<File[]> {
    const fileData = [
      {
        driveFileId: 'file1_drive_id',
        originalName: 'quyet_dinh_thanh_lap.pdf',
        mimeType: 'application/pdf',
        isPublic: false,
      },
      {
        driveFileId: 'file2_drive_id',
        originalName: 'bao_cao_tai_chinh.xlsx',
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        isPublic: false,
      },
      {
        driveFileId: 'file3_drive_id',
        originalName: 'ke_hoach_dao_tao.docx',
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        isPublic: false,
      },
      {
        driveFileId: 'file4_drive_id',
        originalName: 'bien_ban_hop.pdf',
        mimeType: 'application/pdf',
        isPublic: false,
      },
      {
        driveFileId: 'file5_drive_id',
        originalName: 'hop_dong_hop_tac.pdf',
        mimeType: 'application/pdf',
        isPublic: false,
      },
    ];

    const files = this.fileRepository.create(fileData);
    return await this.fileRepository.save(files);
  }

  private async seedDocumentCategories(): Promise<DocumentCategory[]> {
    const categoryData = [
      {
        name: 'Văn bản hành chính',
        description: 'Các loại văn bản hành chính thông thường',
      },
      {
        name: 'Văn bản đào tạo',
        description: 'Các văn bản liên quan đến công tác đào tạo',
      },
      {
        name: 'Văn bản tài chính',
        description: 'Các văn bản liên quan đến tài chính, kế toán',
      },
      {
        name: 'Văn bản hợp tác',
        description: 'Các văn bản hợp tác với đối tác bên ngoài',
      },
      {
        name: 'Văn bản nhân sự',
        description: 'Các văn bản liên quan đến nhân sự, cán bộ',
      },
    ];

    const categories = this.documentCategoryRepository.create(categoryData);
    return await this.documentCategoryRepository.save(categories);
  }

  private async seedDocumentTypes(categories: DocumentCategory[]): Promise<DocumentType[]> {
    const typeData = [
      {
        name: 'Quyết định',
        description: 'Văn bản quyết định',
        documentCategoryId: categories[0].id,
      },
      {
        name: 'Nghị quyết',
        description: 'Văn bản nghị quyết',
        documentCategoryId: categories[0].id,
      },
      {
        name: 'Chỉ thị',
        description: 'Văn bản chỉ thị',
        documentCategoryId: categories[0].id,
      },
      {
        name: 'Thông báo',
        description: 'Văn bản thông báo',
        documentCategoryId: categories[0].id,
      },
      {
        name: 'Báo cáo',
        description: 'Văn bản báo cáo',
        documentCategoryId: categories[2].id,
      },
    ];

    const types = this.documentTypeRepository.create(typeData);
    return await this.documentTypeRepository.save(types);
  }

  private async seedDocuments(
    categories: DocumentCategory[],
    types: DocumentType[],
    files: File[],
    users: User[]
  ): Promise<Document[]> {
    const documentData = [
      {
        title: 'Quyết định thành lập khoa mới',
        content: 'Quyết định thành lập Khoa Công nghệ Thông tin',
        documentType: DocumentTypeEnum.INTERNAL,
        documentCategoryId: categories[0].id,
        fileId: parseInt(files[0].id),
        status: DocumentStatus.DRAFT,
        priority: DocumentPriority.HIGH,
        createdByUserId: users[3].id,
        deadline: new Date('2024-12-31'),
      },
      {
        title: 'Báo cáo tài chính quý 1 năm 2024',
        content: 'Báo cáo tình hình tài chính quý 1 năm 2024',
        documentType: DocumentTypeEnum.INTERNAL,
        documentCategoryId: categories[2].id,
        fileId: parseInt(files[1].id),
        status: DocumentStatus.PENDING,
        priority: DocumentPriority.MEDIUM,
        createdByUserId: users[4].id,
        deadline: new Date('2024-06-30'),
      },
      {
        title: 'Kế hoạch đào tạo năm học 2024-2025',
        content: 'Kế hoạch đào tạo chi tiết cho năm học mới',
        documentType: DocumentTypeEnum.INTERNAL,
        documentCategoryId: categories[1].id,
        fileId: parseInt(files[2].id),
        status: DocumentStatus.PROCESSING,
        priority: DocumentPriority.HIGH,
        createdByUserId: users[5].id,
        deadline: new Date('2024-08-31'),
      },
      {
        title: 'Biên bản họp Hội đồng trường',
        content: 'Biên bản họp Hội đồng trường tháng 3/2024',
        documentType: DocumentTypeEnum.INTERNAL,
        documentCategoryId: categories[0].id,
        fileId: parseInt(files[3].id),
        status: DocumentStatus.APPROVED,
        priority: DocumentPriority.MEDIUM,
        createdByUserId: users[6].id,
        deadline: new Date('2024-04-30'),
      },
      {
        title: 'Hợp đồng hợp tác với doanh nghiệp ABC',
        content: 'Hợp đồng hợp tác đào tạo với công ty ABC',
        documentType: DocumentTypeEnum.OUTGOING,
        documentCategoryId: categories[3].id,
        fileId: parseInt(files[4].id),
        status: DocumentStatus.DRAFT,
        priority: DocumentPriority.HIGH,
        createdByUserId: users[3].id,
        deadline: new Date('2024-12-31'),
      },
    ];

    const documents = this.documentRepository.create(documentData);
    return await this.documentRepository.save(documents);
  }

  private async seedUserPositions(users: User[], positions: Position[]): Promise<void> {
    const userPositionData = [
      {
        userId: users[0].id,
        positionId: positions[0].id,
        startDate: new Date('2020-01-01'),
        endDate: undefined,
      },
      {
        userId: users[1].id,
        positionId: positions[0].id,
        startDate: new Date('2020-01-01'),
        endDate: undefined,
      },
      {
        userId: users[2].id,
        positionId: positions[1].id,
        startDate: new Date('2020-01-01'),
        endDate: undefined,
      },
      {
        userId: users[3].id,
        positionId: positions[2].id,
        startDate: new Date('2021-01-01'),
        endDate: undefined,
      },
      {
        userId: users[4].id,
        positionId: positions[2].id,
        startDate: new Date('2021-01-01'),
        endDate: undefined,
      },
      {
        userId: users[5].id,
        positionId: positions[4].id,
        startDate: new Date('2021-01-01'),
        endDate: undefined,
      },
      {
        userId: users[6].id,
        positionId: positions[3].id,
        startDate: new Date('2022-01-01'),
        endDate: undefined,
      },
    ];

    const userPositions = this.userPositionRepository.create(userPositionData);
    await this.userPositionRepository.save(userPositions);
  }

  private async seedAssignments(users: User[], positions: Position[], units: Unit[]): Promise<void> {
    const assignmentData = [
      {
        userId: users[0].id,
        positionId: positions[0].id,
        unitId: units[0].id,
      },
      {
        userId: users[1].id,
        positionId: positions[0].id,
        unitId: units[0].id,
      },
      {
        userId: users[2].id,
        positionId: positions[1].id,
        unitId: units[0].id,
      },
      {
        userId: users[3].id,
        positionId: positions[2].id,
        unitId: units[3].id,
      },
      {
        userId: users[4].id,
        positionId: positions[2].id,
        unitId: units[4].id,
      },
      {
        userId: users[5].id,
        positionId: positions[4].id,
        unitId: units[1].id,
      },
      {
        userId: users[6].id,
        positionId: positions[3].id,
        unitId: units[3].id,
      },
    ];

    const assignments = this.assignmentRepository.create(assignmentData);
    await this.assignmentRepository.save(assignments);
  }

  private async seedWorkflowTemplates(users: User[]): Promise<WorkflowTemplate[]> {
    const templateData = [
      {
        name: 'Quy trình phê duyệt văn bản thông thường',
        description: 'Quy trình phê duyệt cho các văn bản hành chính thông thường',
        isActive: true,
        createdByUserId: users[0].id,
      },
      {
        name: 'Quy trình phê duyệt văn bản tài chính',
        description: 'Quy trình phê duyệt cho các văn bản liên quan đến tài chính',
        isActive: true,
        createdByUserId: users[0].id,
      },
      {
        name: 'Quy trình phê duyệt văn bản đào tạo',
        description: 'Quy trình phê duyệt cho các văn bản liên quan đến đào tạo',
        isActive: true,
        createdByUserId: users[0].id,
      },
    ];

    const templates = this.workflowTemplateRepository.create(templateData);
    const savedTemplates = await this.workflowTemplateRepository.save(templates);

    // Tạo workflow steps cho từng template
    for (const template of savedTemplates) {
      await this.createWorkflowSteps(template, users);
    }

    return savedTemplates;
  }

  private async createWorkflowSteps(template: WorkflowTemplate, users: User[]): Promise<void> {
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
        description: 'Trưởng phòng phê duyệt văn bản',
        type: StepType.APPROVAL,
        assignedRole: Role.DEPARTMENT_STAFF,
        orderNumber: 3,
        isActive: true,
      },
      {
        templateId: template.id,
        name: 'Phê duyệt lãnh đạo',
        description: 'Lãnh đạo cấp cao phê duyệt',
        type: StepType.APPROVAL,
        assignedRole: Role.SYSTEM_ADMIN,
        orderNumber: 4,
        isActive: true,
      },
      {
        templateId: template.id,
        name: 'Hoàn thành',
        description: 'Văn bản được phê duyệt và hoàn thành',
        type: StepType.END,
        assignedRole: Role.CLERK,
        orderNumber: 5,
        isActive: true,
      },
    ];

    const steps = this.workflowStepRepository.create(stepsData);
    await this.workflowStepRepository.save(steps);
  }

  private async seedWorkflowInstances(
    templates: WorkflowTemplate[],
    documents: Document[],
    users: User[]
  ): Promise<WorkflowInstance[]> {
    const instanceData = [
      {
        templateId: templates[0].id,
        documentId: documents[0].id,
        status: WorkflowStatus.IN_PROGRESS,
        currentStepId: 2, // Đang ở bước "Tạo văn bản"
        createdByUserId: users[3].id,
        startedByUserId: users[3].id,
        startedAt: new Date('2024-01-15'),
      },
      {
        templateId: templates[1].id,
        documentId: documents[1].id,
        status: WorkflowStatus.IN_PROGRESS,
        currentStepId: 3, // Đang ở bước "Phê duyệt trưởng phòng"
        createdByUserId: users[4].id,
        startedByUserId: users[4].id,
        startedAt: new Date('2024-01-20'),
      },
      {
        templateId: templates[2].id,
        documentId: documents[2].id,
        status: WorkflowStatus.IN_PROGRESS,
        currentStepId: 4, // Đang ở bước "Phê duyệt lãnh đạo"
        createdByUserId: users[5].id,
        startedByUserId: users[5].id,
        startedAt: new Date('2024-01-25'),
      },
      {
        templateId: templates[0].id,
        documentId: documents[3].id,
        status: WorkflowStatus.COMPLETED,
        currentStepId: 5, // Đã hoàn thành
        createdByUserId: users[6].id,
        startedByUserId: users[6].id,
        startedAt: new Date('2024-01-10'),
        completedAt: new Date('2024-01-12'),
      },
      {
        templateId: templates[1].id,
        documentId: documents[4].id,
        status: WorkflowStatus.IN_PROGRESS,
        currentStepId: 2, // Đang ở bước "Tạo văn bản"
        createdByUserId: users[3].id,
        startedByUserId: users[3].id,
        startedAt: new Date('2024-02-01'),
      },
    ];

    const instances = this.workflowInstanceRepository.create(instanceData);
    return await this.workflowInstanceRepository.save(instances);
  }

  private async seedWorkflowActionLogs(instances: WorkflowInstance[], users: User[]): Promise<void> {
    const actionLogData = [
      // Instance 1 - Đang ở bước 2
      {
        instanceId: instances[0].id,
        stepId: 1,
        actionByUserId: users[3].id,
        actionType: ActionType.START,
        actionAt: new Date('2024-01-15 09:00:00'),
        note: 'Bắt đầu quy trình phê duyệt',
      },
      {
        instanceId: instances[0].id,
        stepId: 2,
        actionByUserId: users[6].id,
        actionType: ActionType.TRANSFER,
        actionAt: new Date('2024-01-16 14:30:00'),
        note: 'Đã tạo văn bản và chuyển cho trưởng phòng',
      },

      // Instance 2 - Đang ở bước 3
      {
        instanceId: instances[1].id,
        stepId: 1,
        actionByUserId: users[4].id,
        actionType: ActionType.START,
        actionAt: new Date('2024-01-20 08:00:00'),
        note: 'Bắt đầu quy trình phê duyệt tài chính',
      },
      {
        instanceId: instances[1].id,
        stepId: 2,
        actionByUserId: users[6].id,
        actionType: ActionType.TRANSFER,
        actionAt: new Date('2024-01-21 10:15:00'),
        note: 'Đã tạo báo cáo tài chính',
      },
      {
        instanceId: instances[1].id,
        stepId: 3,
        actionByUserId: users[3].id,
        actionType: ActionType.APPROVE,
        actionAt: new Date('2024-01-22 16:45:00'),
        note: 'Trưởng phòng đã phê duyệt',
      },

      // Instance 3 - Đang ở bước 4
      {
        instanceId: instances[2].id,
        stepId: 1,
        actionByUserId: users[5].id,
        actionType: ActionType.START,
        actionAt: new Date('2024-01-25 09:30:00'),
        note: 'Bắt đầu quy trình phê duyệt đào tạo',
      },
      {
        instanceId: instances[2].id,
        stepId: 2,
        actionByUserId: users[6].id,
        actionType: ActionType.TRANSFER,
        actionAt: new Date('2024-01-26 11:20:00'),
        note: 'Đã tạo kế hoạch đào tạo',
      },
      {
        instanceId: instances[2].id,
        stepId: 3,
        actionByUserId: users[4].id,
        actionType: ActionType.APPROVE,
        actionAt: new Date('2024-01-27 15:10:00'),
        note: 'Trưởng phòng đã phê duyệt',
      },

      // Instance 4 - Đã hoàn thành
      {
        instanceId: instances[3].id,
        stepId: 1,
        actionByUserId: users[6].id,
        actionType: ActionType.START,
        actionAt: new Date('2024-01-10 08:00:00'),
        note: 'Bắt đầu quy trình phê duyệt',
      },
      {
        instanceId: instances[3].id,
        stepId: 2,
        actionByUserId: users[6].id,
        actionType: ActionType.TRANSFER,
        actionAt: new Date('2024-01-11 10:30:00'),
        note: 'Đã tạo biên bản họp',
      },
      {
        instanceId: instances[3].id,
        stepId: 3,
        actionByUserId: users[3].id,
        actionType: ActionType.APPROVE,
        actionAt: new Date('2024-01-11 14:15:00'),
        note: 'Trưởng phòng đã phê duyệt',
      },
      {
        instanceId: instances[3].id,
        stepId: 4,
        actionByUserId: users[1].id,
        actionType: ActionType.APPROVE,
        actionAt: new Date('2024-01-12 09:45:00'),
        note: 'Hiệu trưởng đã phê duyệt',
      },
      {
        instanceId: instances[3].id,
        stepId: 5,
        actionByUserId: users[6].id,
        actionType: ActionType.COMPLETE,
        actionAt: new Date('2024-01-12 16:00:00'),
        note: 'Quy trình đã hoàn thành',
      },

      // Instance 5 - Đang ở bước 2
      {
        instanceId: instances[4].id,
        stepId: 1,
        actionByUserId: users[3].id,
        actionType: ActionType.START,
        actionAt: new Date('2024-02-01 08:30:00'),
        note: 'Bắt đầu quy trình phê duyệt hợp đồng',
      },
    ];

    const actionLogs = this.workflowActionLogRepository.create(actionLogData);
    await this.workflowActionLogRepository.save(actionLogs);
  }
}
