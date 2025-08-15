import { ObjectType, Field } from '@nestjs/graphql';
import { Unit } from '../../entities/unit.entity';

@ObjectType()
export class GetUnitOutput {
  @Field(() => Unit, { description: 'Thông tin đơn vị' })
  unit: Unit;
}
