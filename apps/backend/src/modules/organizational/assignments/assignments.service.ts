import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Assignment } from './entities/assignment.entity';
import { CreateAssignmentInput } from './dto/create-assignment/create-assignment.input';
import { UpdateAssignmentInput } from './dto/update-assignment/update-assignment.input';

@Injectable()
export class AssignmentsService {
  constructor(
    @InjectRepository(Assignment)
    private readonly repository: Repository<Assignment>,
  ) {}

  async create(
    createAssignmentInput: CreateAssignmentInput,
  ): Promise<Assignment> {
    const created = this.repository.create({
      userId: createAssignmentInput.userId,
      positionId: createAssignmentInput.positionId,
      unitId: createAssignmentInput.unitId,
    });
    const saved = await this.repository.save(created);
    if (!saved) throw new BadRequestException('Failed to create assignment');
    return saved;
  }

  async findAll(): Promise<Assignment[]> {
    return this.repository.find({ relations: ['user', 'position', 'unit'] });
  }

  async findOne(id: number): Promise<Assignment> {
    const assignment = await this.repository.findOne({
      where: { id },
      relations: ['user', 'position', 'unit'],
    });
    if (!assignment)
      throw new NotFoundException(`Assignment with ID ${id} not found`);
    return assignment;
  }

  async update(
    id: number,
    updateAssignmentInput: UpdateAssignmentInput,
  ): Promise<Assignment> {
    const assignment = await this.repository.findOne({ where: { id } });
    if (!assignment)
      throw new NotFoundException(`Assignment with ID ${id} not found`);
    if (updateAssignmentInput.userId !== undefined)
      assignment.userId = updateAssignmentInput.userId;
    if (updateAssignmentInput.positionId !== undefined)
      assignment.positionId = updateAssignmentInput.positionId;
    if (updateAssignmentInput.unitId !== undefined)
      assignment.unitId = updateAssignmentInput.unitId;
    const updated = await this.repository.save(assignment);
    if (!updated) throw new BadRequestException('Failed to update assignment');
    return updated;
  }

  async remove(id: number): Promise<Assignment> {
    const assignment = await this.repository.findOne({ where: { id } });
    if (!assignment)
      throw new NotFoundException(`Assignment with ID ${id} not found`);
    await this.repository.remove(assignment);
    return assignment;
  }

  async findByUserId(userId: number): Promise<Assignment[]> {
    return this.repository.find({
      where: { userId },
      relations: ['user', 'position', 'unit'],
    });
  }

  async createMany(createAssignmentsInput: CreateAssignmentInput[]) {
    const createdMany = this.repository.create(createAssignmentsInput);
    return this.repository.save(createdMany);
  }
}
