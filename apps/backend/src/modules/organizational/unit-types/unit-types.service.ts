import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUnitTypeInput } from './dto/create-unit-type/create-unit-type.input';
import { UpdateUnitTypeInput } from './dto/update-unit-type/update-unit-type.input';
import { InjectRepository } from '@nestjs/typeorm';
import { UnitType } from './entities/unit-type.entity';
import { FindOptionsWhere, ILike, Repository } from 'typeorm';
import { CreateUnitTypeOutput } from './dto/create-unit-type/create-unit-type.output';
import { UpdateUnitTypeOutput } from './dto/update-unit-type/update-unit-type.output';
import { RemoveUnitTypeOutput } from './dto/remove-unit-type/remove-unit-type.output';
import { GetUnitTypeOutput } from './dto/get-unit-type/get-unit-type.output';
import { GetUnitTypesPaginatedInput } from './dto/get-unit-types-paginated/get-unit-types-paginated.input';
import { PageMetaDto } from 'src/common/shared/pagination/page-meta.dto';
import { PageDto } from 'src/common/shared/pagination/page.dto';

@Injectable()
export class UnitTypesService {
  constructor(
    @InjectRepository(UnitType)
    private readonly repository: Repository<UnitType>,
  ) {}
  async create(
    createUnitTypeInput: CreateUnitTypeInput,
  ): Promise<CreateUnitTypeOutput> {
    const created = this.repository.create({
      typeName: createUnitTypeInput.typeName,
      ...(createUnitTypeInput.description !== undefined && {
        description: createUnitTypeInput.description,
      }),
    });
    const saved = await this.repository.save(created);
    if (!saved) throw new BadRequestException();

    return {
      unitType: saved,
    };
  }

  async findAll(input: GetUnitTypesPaginatedInput): Promise<PageDto<UnitType>> {
    const { search, take, order, skip } = input;

    // Xây dựng điều kiện WHERE
    const where: FindOptionsWhere<UnitType>[] = [];

    if (search) {
      where.push({ typeName: ILike(`%${search}%`) }); // PostgreSQL: ILike, MySQL: Like
    }

    // Gọi findAndCount thay cho queryBuilder
    const [data, itemCount] = await this.repository.findAndCount({
      where: where.length > 0 ? where : undefined,
      order: { id: order },
      skip: skip,
      take: take,
    });

    const pageMetaDto = new PageMetaDto({ pageOptionsDto: input, itemCount });
    return new PageDto(data, pageMetaDto);
  }

  async findOne(id: number): Promise<GetUnitTypeOutput> {
    const unitType = await this.repository.findOne({ where: { id } });
    if (!unitType) {
      throw new BadRequestException(`UnitType with ID ${id} not found`);
    }

    return {
      unitType: unitType,
    };
  }

  async update(
    id: number,
    updateUnitTypeInput: UpdateUnitTypeInput,
  ): Promise<UpdateUnitTypeOutput> {
    const unitType = await this.repository.findOne({ where: { id } });
    if (!unitType) {
      throw new BadRequestException(`UnitType with ID ${id} not found`);
    }

    // Chỉ cập nhật các field có giá trị
    if (updateUnitTypeInput.typeName !== undefined) {
      unitType.typeName = updateUnitTypeInput.typeName;
    }
    if (updateUnitTypeInput.description !== undefined) {
      unitType.description = updateUnitTypeInput.description;
    }

    const updated = await this.repository.save(unitType);
    if (!updated) throw new BadRequestException();

    return {
      unitType: updated,
    };
  }

  async remove(id: number): Promise<RemoveUnitTypeOutput> {
    const unitType = await this.repository.findOne({ where: { id } });
    if (!unitType) {
      throw new BadRequestException(`UnitType with ID ${id} not found`);
    }

    const removed = await this.repository.remove(unitType);
    if (!removed) throw new BadRequestException();
    return {
      unitType: null,
    };
  }
}
