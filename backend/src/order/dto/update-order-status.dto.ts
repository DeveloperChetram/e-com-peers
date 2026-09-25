import { OrderStatus } from '../../generated/prisma/enums';

export class UpdateOrderStatusDto {
  status: OrderStatus;
}
