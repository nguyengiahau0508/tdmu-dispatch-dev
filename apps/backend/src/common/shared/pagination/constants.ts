import { registerEnumType } from '@nestjs/graphql';

export enum Order {
  ASC = 'ASC',
  DESC = 'DESC',
}

registerEnumType(Order, {
  name: 'Order',
  description: 'Thứ tự sắp xếp',
});
