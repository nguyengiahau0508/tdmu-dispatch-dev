import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePositionInput } from './dto/create-position/create-position.input';
import { UpdatePositionInput } from './dto/update-position/update-position.input';
import { Position } from './entities/position.entity';
import { GetPositionsPaginatedInput } from './dto/get-positions-paginated/get-positions-paginated.input';
import { GetPositionsPaginatedResponse } from './dto/get-positions-paginated/get-positions-paginated.response';
import { Metadata } from 'src/common/graphql/metadata.dto';
import { Like } from 'typeorm';

@Injectable()
export class PositionsService {
  constructor(
    @InjectRepository(Position)
    private readonly repository: Repository<Position>
  ) {}

  async create(createPositionInput: CreatePositionInput): Promise<Position> {
    const created = this.repository.create({
      positionName: createPositionInput.positionName,
    });
    const saved = await this.repository.save(created);
    if (!saved) throw new BadRequestException('Failed to create position');
    return saved;
  }

  async findAll(): Promise<Position[]> {
    return this.repository.find();
  }

  async findOne(id: number): Promise<Position> {
    const position = await this.repository.findOne({ where: { id } });
    if (!position) throw new BadRequestException(`Position with ID ${id} not found`);
    return position;
  }

  async update(id: number, updatePositionInput: UpdatePositionInput): Promise<Position> {
    const position = await this.repository.findOne({ where: { id } });
    if (!position) throw new BadRequestException(`Position with ID ${id} not found`);
    if (updatePositionInput.positionName !== undefined) {
      position.positionName = updatePositionInput.positionName;
    }
    const updated = await this.repository.save(position);
    if (!updated) throw new BadRequestException('Failed to update position');
    return updated;
  }

  async remove(id: number): Promise<{ success: boolean }> {
    const position = await this.repository.findOne({ where: { id } });
    if (!position) throw new BadRequestException(`Position with ID ${id} not found`);
    await this.repository.remove(position);
    return { success: true };
  }

  async findPaginated(input: GetPositionsPaginatedInput): Promise<GetPositionsPaginatedResponse> {
    const { search, skip, take = 10 } = input;
    const where = search ? { positionName: Like(`%${search}%`) } : {};
    const [data, totalCount] = await this.repository.findAndCount({
      where,
      skip,
      take,
    });
    const metadata: Metadata = {
      statusCode: 200,
      message: 'Lấy danh sách chức vụ phân trang thành công',
      timestamp: new Date().toISOString(),
      path: '',
    };
    return {
      data,
      metadata,
      totalCount,
      hasNextPage: skip + take < totalCount,
    };
  }
}
