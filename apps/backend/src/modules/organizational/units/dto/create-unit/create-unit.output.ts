import { ObjectType, Field } from '@nestjs/graphql';
import { Unit } from '../../entities/unit.entity';

@ObjectType()
export class CreateUnitOutput {
  @Field(() => Unit, { description: 'Đơn vị đã tạo' })
  unit: Unit;
}
