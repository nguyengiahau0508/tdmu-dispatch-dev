import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, ILike } from 'typeorm';
import { Department } from './entities/department.entity';
import { CreateDepartmentInput } from './dto/create-department/create-department.input';
import { UpdateDepartmentInput } from './dto/update-department/update-department.input';
import { GetDepartmentsPaginatedInput } from './dto/get-departments-paginated/get-departments-paginated.input';
import { GetDepartmentsPaginatedResponse } from './dto/get-departments-paginated/get-departments-paginated.response';
import { PageMetaDto } from 'src/common/shared/pagination/page-meta.dto';
import { PageDto } from 'src/common/shared/pagination/page.dto';

@Injectable()
export class DepartmentsService {
  constructor(
    @InjectRepository(Department)
    private readonly repository: Repository<Department>
  ) {}

  async create(createDepartmentInput: CreateDepartmentInput): Promise<Department> {
    const created = this.repository.create(createDepartmentInput);
    const saved = await this.repository.save(created);
    if (!saved) throw new BadRequestException('Tạo phòng ban thất bại');
    return saved;
  }

  findAllDepartmentBySearch(search: string) {
    const where: FindOptionsWhere<Department>[] = [];
    if (search) {
      where.push({ name: ILike(`%${search}%`) });
      const searchId = Number(search);
      if (!isNaN(searchId)) {
        where.push({ id: searchId });
      }
    }
    return this.repository.find({
      where: where.length > 0 ? where : undefined
    });
  }

  async findPaginated(input: GetDepartmentsPaginatedInput): Promise<PageDto<Department>> {
    const { search, order, parentDepartmentId, skip, take } = input;
    const where: FindOptionsWhere<Department>[] = [];
    if (search) {
      where.push(
        { name: ILike(`%${search}%`), ...(parentDepartmentId && { parentDepartmentId }) },
        { description: ILike(`%${search}%`), ...(parentDepartmentId && { parentDepartmentId }) },
      );
    } else if (parentDepartmentId) {
      where.push({ parentDepartmentId });
    }
    const [data, itemCount] = await this.repository.findAndCount({
      where: where.length > 0 ? where : undefined,
      relations: ['parentDepartment', 'children'],
      order: { id: order },
      skip,
      take,
    });
    const pageMetaDto = new PageMetaDto({ pageOptionsDto: input, itemCount });
    return new PageDto(data, pageMetaDto);
  }

  async findOne(id: number): Promise<Department> {
    const department = await this.repository.findOne({
      where: { id },
      relations: ['parentDepartment', 'children'],
    });
    if (!department) throw new NotFoundException(`Không tìm thấy phòng ban với ID ${id}`);
    return department;
  }

  async update(id: number, updateDepartmentInput: UpdateDepartmentInput): Promise<Department> {
    const department = await this.repository.findOne({ where: { id } });
    if (!department) throw new NotFoundException(`Không tìm thấy phòng ban với ID ${id}`);
    Object.assign(department, updateDepartmentInput);
    const updated = await this.repository.save(department);
    if (!updated) throw new BadRequestException('Cập nhật phòng ban thất bại');
    return updated;
  }

  async remove(id: number): Promise<Department> {
    const department = await this.repository.findOne({ where: { id } });
    if (!department) throw new NotFoundException(`Không tìm thấy phòng ban với ID ${id}`);
    // Kiểm tra có phòng ban con không
    const children = await this.repository.find({ where: { parentDepartmentId: id } });
    if (children.length > 0) {
      throw new BadRequestException('Không thể xóa phòng ban có phòng ban con');
    }
    return this.repository.remove(department);
  }
}
