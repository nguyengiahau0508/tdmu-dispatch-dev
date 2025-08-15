import { ObjectType, Field } from '@nestjs/graphql';
import { Position } from '../../entities/position.entity';

@ObjectType()
export class CreatePositionOutput {
  @Field(() => Position, { description: 'Chức vụ đã tạo' })
  position: Position;
}
