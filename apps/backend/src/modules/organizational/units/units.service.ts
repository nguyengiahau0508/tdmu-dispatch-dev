import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUnitInput } from './dto/create-unit/create-unit.input';
import { UpdateUnitInput } from './dto/update-unit/update-unit.input';
import { InjectRepository } from '@nestjs/typeorm';
import { Unit } from './entities/unit.entity';
import { FindOptionsWhere, ILike, Repository } from 'typeorm';
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
    @InjectRepository(Unit) private readonly repository: Repository<Unit>,
  ) {}

  async create(createUnitInput: CreateUnitInput): Promise<CreateUnitOutput> {
    const created = this.repository.create({
      unitName: createUnitInput.unitName,
      unitTypeId: createUnitInput.unitTypeId,
      parentUnitId: createUnitInput.parentUnitId,
      establishmentDate: createUnitInput.establishmentDate
        ? new Date(createUnitInput.establishmentDate)
        : undefined,
      ...(createUnitInput.email !== undefined && {
        email: createUnitInput.email,
      }),
      ...(createUnitInput.phone !== undefined && {
        phone: createUnitInput.phone,
      }),
    });

    const saved = await this.repository.save(created);
    if (!saved) throw new BadRequestException();

    return {
      unit: saved,
    };
  }

  async findAll(input: GetUnitsPaginatedInput): Promise<PageDto<Unit>> {
    const { search, order, unitTypeId, parentUnitId, skip, take } = input;

    // Gán điều kiện where
    const where: FindOptionsWhere<Unit>[] = [];

    // Nếu có search => OR nhiều trường
    if (search) {
      where.push(
        {
          unitName: ILike(`%${search}%`),
          ...(unitTypeId && { unitTypeId }),
          ...(parentUnitId && { parentUnitId }),
        },
        {
          email: ILike(`%${search}%`),
          ...(unitTypeId && { unitTypeId }),
          ...(parentUnitId && { parentUnitId }),
        },
        {
          phone: ILike(`%${search}%`),
          ...(unitTypeId && { unitTypeId }),
          ...(parentUnitId && { parentUnitId }),
        },
      );
    } else {
      // Nếu không có search, chỉ lọc theo unitTypeId / parentUnitId
      const condition: FindOptionsWhere<Unit> = {};
      if (unitTypeId) condition.unitTypeId = unitTypeId;
      if (parentUnitId) condition.parentUnitId = parentUnitId;
      if (Object.keys(condition).length > 0) {
        where.push(condition);
      }
    }

    const [data, itemCount] = await this.repository.findAndCount({
      where: where.length > 0 ? where : undefined,
      relations: ['unitType', 'parentUnit', 'childUnits'],
      order: { id: order },
      skip,
      take,
    });

    const pageMetaDto = new PageMetaDto({ pageOptionsDto: input, itemCount });
    return new PageDto(data, pageMetaDto);
  }

  async findOne(id: number): Promise<GetUnitOutput> {
    const unit = await this.repository.findOne({
      where: { id },
      relations: ['unitType', 'parentUnit', 'childUnits'],
    });

    if (!unit) {
      throw new BadRequestException(`Unit with ID ${id} not found`);
    }

    return {
      unit: unit,
    };
  }

  async update(
    id: number,
    updateUnitInput: UpdateUnitInput,
  ): Promise<UpdateUnitOutput> {
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
      unit: updated,
    };
  }

  async remove(id: number): Promise<RemoveUnitOutput> {
    const unit = await this.repository.findOne({ where: { id } });
    if (!unit) {
      throw new BadRequestException(`Unit with ID ${id} not found`);
    }

    // Kiểm tra xem có đơn vị con nào không
    const childUnits = await this.repository.find({
      where: { parentUnitId: id },
    });
    if (childUnits.length > 0) {
      throw new BadRequestException(
        `Cannot delete unit with ID ${id} because it has child units`,
      );
    }

    const removed = await this.repository.remove(unit);
    if (!removed) throw new BadRequestException();

    return {
      success: true,
    };
  }

  async findAllUnits(): Promise<Unit[]> {
    return this.repository.find();
  }
}
