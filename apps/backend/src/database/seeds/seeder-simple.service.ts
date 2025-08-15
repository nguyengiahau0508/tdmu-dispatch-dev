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
import { Document, DocumentTypeEnum } from '../../modules/dispatch/documents/entities/document.entity';
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
export class SeederSimpleService {
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
    // Sử dụng query runner để tắt foreign key checks và xóa dữ liệu
    const queryRunner = this.workflowActionLogRepository.manager.connection.createQueryRunner();
    
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();
      
      // Tắt foreign key checks
      await queryRunner.query('SET FOREIGN_KEY_CHECKS = 0');
      
      // Xóa tất cả dữ liệu từ các bảng
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
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
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

    // 6. Tạo Files
    console.log('📁 Tạo Files...');
    const files = await this.seedFiles(users);

    // 7. Tạo Document Categories
    console.log('📁 Tạo Document Categories...');
    const documentCategories = await this.seedDocumentCategories();

    // 8. Tạo Document Types
    console.log('📄 Tạo Document Types...');
    const documentTypes = await this.seedDocumentTypes(documentCategories);

    // 9. Tạo Documents
    console.log('📄 Tạo Documents...');
    const documents = await this.seedDocuments(documentCategories, documentTypes, files, users);

    // 10. Tạo User Positions
    console.log('👤 Tạo User Positions...');
    await this.seedUserPositions(users, positions);

    // 11. Tạo Assignments
    console.log('📋 Tạo Assignments...');
    await this.seedAssignments(users, positions, units);

    // 12. Tạo Workflow Templates
    console.log('🔄 Tạo Workflow Templates...');
    const templates = await this.seedWorkflowTemplates(users);

    // 13. Tạo Workflow Instances
    console.log('🔄 Tạo Workflow Instances...');
    const instances = await this.seedWorkflowInstances(templates, documents, users);

    // 14. Tạo Workflow Action Logs
    console.log('📝 Tạo Workflow Action Logs...');
    await this.seedWorkflowActionLogs(instances, users);

    console.log('✅ Hoàn thành tạo dữ liệu mẫu!');
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
      {
        email: 'user3@tdmu.edu.vn',
        passwordHash: hashedPassword,
        firstName: 'Lê Thị',
        lastName: 'C',
        isActive: true,
        isFirstLogin: true,
        roles: [Role.BASIC_USER],
      },
      {
        email: 'user4@tdmu.edu.vn',
        passwordHash: hashedPassword,
        firstName: 'Phạm Văn',
        lastName: 'D',
        isActive: true,
        isFirstLogin: true,
        roles: [Role.BASIC_USER],
      },
      {
        email: 'user5@tdmu.edu.vn',
        passwordHash: hashedPassword,
        firstName: 'Hoàng Thị',
        lastName: 'E',
        isActive: true,
        isFirstLogin: true,
        roles: [Role.BASIC_USER],
      },
    ];

    const users = this.userRepository.create(userData);
    return await this.userRepository.save(users);
  }

  private async seedFiles(users: User[]): Promise<File[]> {
    const fileData = [
      {
        driveFileId: 'file1_drive_id',
        originalName: 'document1.pdf',
        mimeType: 'application/pdf',
        allowedUserIds: [users[0].id, users[1].id],
        isPublic: false,
      },
      {
        driveFileId: 'file2_drive_id',
        originalName: 'report1.docx',
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        allowedUserIds: [users[2].id, users[3].id],
        isPublic: false,
      },
      {
        driveFileId: 'file3_drive_id',
        originalName: 'presentation1.pptx',
        mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        allowedUserIds: [users[4].id, users[5].id],
        isPublic: false,
      },
      {
        driveFileId: 'file4_drive_id',
        originalName: 'spreadsheet1.xlsx',
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        allowedUserIds: [users[6].id, users[7].id],
        isPublic: false,
      },
      {
        driveFileId: 'file5_drive_id',
        originalName: 'image1.jpg',
        mimeType: 'image/jpeg',
        allowedUserIds: [users[8].id, users[9].id],
        isPublic: true,
      },
      {
        driveFileId: 'file6_drive_id',
        originalName: 'document2.pdf',
        mimeType: 'application/pdf',
        allowedUserIds: [users[0].id, users[2].id],
        isPublic: false,
      },
      {
        driveFileId: 'file7_drive_id',
        originalName: 'report2.docx',
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        allowedUserIds: [users[1].id, users[3].id],
        isPublic: false,
      },
      {
        driveFileId: 'file8_drive_id',
        originalName: 'presentation2.pptx',
        mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        allowedUserIds: [users[4].id, users[6].id],
        isPublic: false,
      },
      {
        driveFileId: 'file9_drive_id',
        originalName: 'spreadsheet2.xlsx',
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        allowedUserIds: [users[5].id, users[7].id],
        isPublic: false,
      },
      {
        driveFileId: 'file10_drive_id',
        originalName: 'image2.png',
        mimeType: 'image/png',
        allowedUserIds: [users[8].id, users[9].id],
        isPublic: true,
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

  private async seedDocumentTypes(categories: DocumentCategory[]): Promise<DocumentType[]> {
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
      {
        name: 'Nghị quyết',
        description: 'Văn bản nghị quyết',
      },
      {
        name: 'Chỉ thị',
        description: 'Văn bản chỉ thị',
      },
    ];

    const types = this.documentTypeRepository.create(typeData);
    return await this.documentTypeRepository.save(types);
  }

  private async seedDocuments(categories: DocumentCategory[], documentTypes: DocumentType[], files: File[], users: User[]): Promise<Document[]> {
    const documentData = [
      {
        title: 'Quyết định về việc thành lập khoa mới',
        content: 'Nội dung quyết định thành lập khoa Công nghệ Thông tin',
        documentType: DocumentTypeEnum.INTERNAL,
        documentCategoryId: categories[0].id,
        fileId: parseInt(files[0].id),
        status: 'draft',
      },
      {
        title: 'Công văn gửi Bộ Giáo dục và Đào tạo',
        content: 'Nội dung công văn báo cáo tình hình đào tạo',
        documentType: DocumentTypeEnum.OUTGOING,
        documentCategoryId: categories[1].id,
        fileId: parseInt(files[1].id),
        status: 'pending',
      },
      {
        title: 'Thông báo về lịch thi học kỳ',
        content: 'Thông báo lịch thi học kỳ 1 năm học 2024-2025',
        documentType: DocumentTypeEnum.INTERNAL,
        documentCategoryId: categories[2].id,
        fileId: parseInt(files[2].id),
        status: 'approved',
      },
      {
        title: 'Báo cáo tài chính quý 1',
        content: 'Báo cáo tình hình tài chính quý 1 năm 2024',
        documentType: DocumentTypeEnum.INTERNAL,
        documentCategoryId: categories[2].id,
        fileId: parseInt(files[3].id),
        status: 'draft',
      },
      {
        title: 'Kế hoạch đào tạo năm học 2024-2025',
        content: 'Kế hoạch đào tạo chi tiết cho năm học mới',
        documentType: DocumentTypeEnum.INTERNAL,
        documentCategoryId: categories[1].id,
        fileId: parseInt(files[4].id),
        status: 'pending',
      },
      {
        title: 'Biên bản họp Hội đồng trường',
        content: 'Biên bản họp Hội đồng trường tháng 3/2024',
        documentType: DocumentTypeEnum.INTERNAL,
        documentCategoryId: categories[0].id,
        fileId: parseInt(files[5].id),
        status: 'approved',
      },
      {
        title: 'Hợp đồng hợp tác với doanh nghiệp',
        content: 'Hợp đồng hợp tác đào tạo với công ty ABC',
        documentType: DocumentTypeEnum.OUTGOING,
        documentCategoryId: categories[3].id,
        fileId: parseInt(files[6].id),
        status: 'draft',
      },
      {
        title: 'Đơn đề nghị tăng lương',
        content: 'Đơn đề nghị tăng lương của cán bộ giảng viên',
        documentType: DocumentTypeEnum.INTERNAL,
        documentCategoryId: categories[4].id,
        fileId: parseInt(files[7].id),
        status: 'pending',
      },
      {
        title: 'Nghị quyết về chính sách mới',
        content: 'Nghị quyết về chính sách đào tạo mới',
        documentType: DocumentTypeEnum.INTERNAL,
        documentCategoryId: categories[0].id,
        fileId: parseInt(files[8].id),
        status: 'approved',
      },
      {
        title: 'Chỉ thị về công tác an toàn',
        content: 'Chỉ thị về công tác đảm bảo an toàn trường học',
        documentType: DocumentTypeEnum.INTERNAL,
        documentCategoryId: categories[0].id,
        fileId: parseInt(files[9].id),
        status: 'draft',
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
        positionId: positions[1].id,
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
        positionId: positions[4].id,
        startDate: new Date('2021-01-01'),
        endDate: undefined,
      },
      {
        userId: users[5].id,
        positionId: positions[3].id,
        startDate: new Date('2022-01-01'),
        endDate: undefined,
      },
      {
        userId: users[6].id,
        positionId: positions[3].id,
        startDate: new Date('2022-01-01'),
        endDate: undefined,
      },
      {
        userId: users[7].id,
        positionId: positions[3].id,
        startDate: new Date('2022-01-01'),
        endDate: undefined,
      },
      {
        userId: users[8].id,
        positionId: positions[3].id,
        startDate: new Date('2022-01-01'),
        endDate: undefined,
      },
      {
        userId: users[9].id,
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
        positionId: positions[1].id,
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
        positionId: positions[4].id,
        unitId: units[4].id,
      },
      {
        userId: users[5].id,
        positionId: positions[3].id,
        unitId: units[1].id,
      },
      {
        userId: users[6].id,
        positionId: positions[3].id,
        unitId: units[2].id,
      },
      {
        userId: users[7].id,
        positionId: positions[3].id,
        unitId: units[1].id,
      },
      {
        userId: users[8].id,
        positionId: positions[3].id,
        unitId: units[2].id,
      },
      {
        userId: users[9].id,
        positionId: positions[3].id,
        unitId: units[1].id,
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
        name: 'Tạo văn bản',
        description: 'Bước tạo văn bản ban đầu',
        type: StepType.START,
        assignedRole: Role.BASIC_USER,
        orderNumber: 1,
        isActive: true,
      },
      {
        templateId: template.id,
        name: 'Phê duyệt trưởng phòng',
        description: 'Phê duyệt bởi trưởng phòng ban',
        type: StepType.APPROVAL,
        assignedRole: Role.DEPARTMENT_STAFF,
        orderNumber: 2,
        isActive: true,
      },
      {
        templateId: template.id,
        name: 'Phê duyệt phó hiệu trưởng',
        description: 'Phê duyệt bởi phó hiệu trưởng',
        type: StepType.APPROVAL,
        assignedRole: Role.UNIVERSITY_LEADER,
        orderNumber: 3,
        isActive: true,
      },
      {
        templateId: template.id,
        name: 'Phê duyệt hiệu trưởng',
        description: 'Phê duyệt cuối cùng bởi hiệu trưởng',
        type: StepType.END,
        assignedRole: Role.UNIVERSITY_LEADER,
        orderNumber: 4,
        isActive: true,
      },
    ];

    const steps = this.workflowStepRepository.create(stepsData);
    await this.workflowStepRepository.save(steps);
  }

  private async seedWorkflowInstances(templates: WorkflowTemplate[], documents: Document[], users: User[]): Promise<WorkflowInstance[]> {
    const instanceData = [
      {
        templateId: templates[0].id,
        documentId: documents[0].id,
        status: WorkflowStatus.IN_PROGRESS,
        currentStepId: 1,
        createdByUserId: users[0].id,
      },
      {
        templateId: templates[1].id,
        documentId: documents[1].id,
        status: WorkflowStatus.COMPLETED,
        currentStepId: 4,
        createdByUserId: users[1].id,
      },
      {
        templateId: templates[2].id,
        documentId: documents[2].id,
        status: WorkflowStatus.IN_PROGRESS,
        currentStepId: 2,
        createdByUserId: users[2].id,
      },
    ];

    const instances = this.workflowInstanceRepository.create(instanceData);
    return await this.workflowInstanceRepository.save(instances);
  }

  private async seedWorkflowActionLogs(instances: WorkflowInstance[], users: User[]): Promise<void> {
    const actionLogData = [
      {
        instanceId: instances[0].id,
        stepId: 1,
        actionType: ActionType.START,
        actionByUserId: users[0].id,
        actionAt: new Date(),
        note: 'Đã tạo văn bản',
      },
      {
        instanceId: instances[1].id,
        stepId: 1,
        actionType: ActionType.START,
        actionByUserId: users[1].id,
        actionAt: new Date(),
        note: 'Đã tạo văn bản',
      },
      {
        instanceId: instances[1].id,
        stepId: 2,
        actionType: ActionType.APPROVE,
        actionByUserId: users[3].id,
        actionAt: new Date(),
        note: 'Đã phê duyệt',
      },
      {
        instanceId: instances[2].id,
        stepId: 1,
        actionType: ActionType.START,
        actionByUserId: users[2].id,
        actionAt: new Date(),
        note: 'Đã tạo văn bản',
      },
    ];

    const actionLogs = this.workflowActionLogRepository.create(actionLogData);
    await this.workflowActionLogRepository.save(actionLogs);
  }
}
