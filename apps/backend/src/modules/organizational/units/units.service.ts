import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUnitInput } from './dto/create-unit/create-unit.input';
import { UpdateUnitInput } from './dto/update-unit/update-unit.input';
import { InjectRepository } from '@nestjs/typeorm';
import { Unit } from './entities/unit.entity';
import { Repository } from 'typeorm';
import { CreateUnitOutput } from './dto/create-unit/create-unit.output';
import { UpdateUnitOutput } from './dto/update-unit/update-unit.output';
import { RemoveUnitOutput } from './dto/remove-unit/remove-unit.output';
import { GetUnitOutput } from './dto/get-unit/get-unit.output';
import { GetUnitsPaginatedInput } from './dto/get-units-paginated/get-units-paginated.input';
import { PageMetaDto } from 'src/common/shared/pagination/page-meta.dto';
import { PageDto } from 'src/common/shared/pagination/page.dto';

@Injectable()
export class UnitsService {
  constructor(
    @InjectRepository(Unit) private readonly repository: Repository<Unit>
  ) { }

  async create(createUnitInput: CreateUnitInput): Promise<CreateUnitOutput> {
    const created = this.repository.create({
      unitName: createUnitInput.unitName,
      unitTypeId: createUnitInput.unitTypeId,
      parentUnitId: createUnitInput.parentUnitId,
      establishmentDate: createUnitInput.establishmentDate ? new Date(createUnitInput.establishmentDate) : undefined,
      ...(createUnitInput.email !== undefined && { email: createUnitInput.email }),
      ...(createUnitInput.phone !== undefined && { phone: createUnitInput.phone })
    })

    const saved = await this.repository.save(created)
    if (!saved) throw new BadRequestException()

    return {
      unit: saved
    }
  }

  async findAll(input: GetUnitsPaginatedInput): Promise<PageDto<Unit>> {
    const { search, page, take, order, unitTypeId, parentUnitId } = input;

    // Tạo query builder với relations
    const queryBuilder = this.repository.createQueryBuilder('unit')
      .leftJoinAndSelect('unit.unitType', 'unitType')
      .leftJoinAndSelect('unit.parentUnit', 'parentUnit')
      .leftJoinAndSelect('unit.childUnits', 'childUnits');

    // Thêm điều kiện tìm kiếm
    if (search) {
      queryBuilder.where(
        'unit.unitName LIKE :search OR unit.email LIKE :search OR unit.phone LIKE :search',
        { search: `%${search}%` }
      );
    }

    // Thêm điều kiện lọc theo loại đơn vị
    if (unitTypeId) {
      queryBuilder.andWhere('unit.unitTypeId = :unitTypeId', { unitTypeId });
    }

    // Thêm điều kiện lọc theo đơn vị cha
    if (parentUnitId) {
      queryBuilder.andWhere('unit.parentUnitId = :parentUnitId', { parentUnitId });
    }

    // Thêm sắp xếp
    queryBuilder.orderBy('unit.id', order);

    // Thêm phân trang
    queryBuilder.skip(input.skip).take(take);

    // Thực hiện query
    const [data, itemCount] = await queryBuilder.getManyAndCount();
    // Tạo metadata cho phân trang
    const pageMetaDto = new PageMetaDto({ pageOptionsDto: input, itemCount });
    return new PageDto(data, pageMetaDto);
  }

  async findOne(id: number): Promise<GetUnitOutput> {
    const unit = await this.repository.findOne({
      where: { id },
      relations: ['unitType', 'parentUnit', 'childUnits']
    });

    if (!unit) {
      throw new BadRequestException(`Unit with ID ${id} not found`);
    }

    return {
      unit: unit
    }
  }

  async update(id: number, updateUnitInput: UpdateUnitInput): Promise<UpdateUnitOutput> {
    const unit = await this.repository.findOne({ where: { id } });
    if (!unit) {
      throw new BadRequestException(`Unit with ID ${id} not found`);
    }

    // Chỉ cập nhật các field có giá trị
    if (updateUnitInput.unitName !== undefined) {
      unit.unitName = updateUnitInput.unitName;
    }
    if (updateUnitInput.unitTypeId !== undefined) {
      unit.unitTypeId = updateUnitInput.unitTypeId;
    }
    if (updateUnitInput.parentUnitId !== undefined) {
      unit.parentUnitId = updateUnitInput.parentUnitId;
    }
    if (updateUnitInput.establishmentDate !== undefined) {
      unit.establishmentDate = new Date(updateUnitInput.establishmentDate);
    }
    if (updateUnitInput.email !== undefined) {
      unit.email = updateUnitInput.email;
    }
    if (updateUnitInput.phone !== undefined) {
      unit.phone = updateUnitInput.phone;
    }

    const updated = await this.repository.save(unit);
    if (!updated) throw new BadRequestException();

    return {
      unit: updated
    }
  }

  async remove(id: number): Promise<RemoveUnitOutput> {
    const unit = await this.repository.findOne({ where: { id } });
    if (!unit) {
      throw new BadRequestException(`Unit with ID ${id} not found`);
    }

    // Kiểm tra xem có đơn vị con nào không
    const childUnits = await this.repository.find({ where: { parentUnitId: id } });
    if (childUnits.length > 0) {
      throw new BadRequestException(`Cannot delete unit with ID ${id} because it has child units`);
    }

    const removed = await this.repository.remove(unit);
    if (!removed) throw new BadRequestException();

    return {
      success: true
    }
  }

  async findAllUnits(): Promise<Unit[]> {
    return this.repository.find();
  }
}
