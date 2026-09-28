import { ShipmentStatus } from '../../generated/prisma/enums';

export class CreateShipmentDto {
  orderId: string;
  carrier?: string;
  trackingNumber?: string;
  assignedStaffId?: number;
  initialLocation?: string;
  note?: string;
}

export class AddShipmentLogDto {
  status: ShipmentStatus;
  location?: string;
  note?: string;
}
