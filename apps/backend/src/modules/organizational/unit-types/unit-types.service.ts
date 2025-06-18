import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUnitTypeInput } from './dto/create-unit-type/create-unit-type.input';
import { UpdateUnitTypeInput } from './dto/update-unit-type/update-unit-type.input';
import { InjectRepository } from '@nestjs/typeorm';
import { UnitType } from './entities/unit-type.entity';
import { Repository } from 'typeorm';
import { CreateUnitTypeOutput } from './dto/create-unit-type/create-unit-type.output';
import { UpdateUnitTypeOutput } from './dto/update-unit-type/update-unit-type.output';
import { RemoveUnitTypeOutput } from './dto/remove-unit-type/remove-unit-type.output';
import { GetUnitTypeOutput } from './dto/get-unit-type/get-unit-type.output';

@Injectable()
export class UnitTypesService {
  constructor(
    @InjectRepository(UnitType) private readonly repository: Repository<UnitType>
  ) { }
  async create(createUnitTypeInput: CreateUnitTypeInput): Promise<CreateUnitTypeOutput> {
    const created = this.repository.create(createUnitTypeInput)
    const saved = await this.repository.save(created)
    if (!saved) throw new BadRequestException()

    return {
      unitType: saved
    }
  }

  findAll() {
    return `This action returns all unitTypes`;
  }

  async findOne(id: number): Promise<GetUnitTypeOutput> {
    const unitType = await this.repository.findOne({ where: { id } });
    if (!unitType) {
      throw new BadRequestException(`UnitType with ID ${id} not found`);
    }

    return {
      unitType: unitType
    }
  }

  async update(id: number, updateUnitTypeInput: UpdateUnitTypeInput): Promise<UpdateUnitTypeOutput> {
    const unitType = await this.repository.findOne({ where: { id } });
    if (!unitType) {
      throw new BadRequestException(`UnitType with ID ${id} not found`);
    }

    Object.assign(unitType, updateUnitTypeInput);
    const updated = await this.repository.save(unitType);
    if (!updated) throw new BadRequestException();

    return {
      unitType: updated
    }
  }

  async remove(id: number): Promise<RemoveUnitTypeOutput> {
    const unitType = await this.repository.findOne({ where: { id } });
    if (!unitType) {
      throw new BadRequestException(`UnitType with ID ${id} not found`);
    }

    const removed = await this.repository.remove(unitType);
    if (!removed) throw new BadRequestException();

    return {
      unitType: removed
    }
  }
}
