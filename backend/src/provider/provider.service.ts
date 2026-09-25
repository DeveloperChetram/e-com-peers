import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStaffDto, UpdateStaffDto } from './dto/staff.dto';
import { AddShipmentLogDto, CreateShipmentDto } from './dto/shipment.dto';
import {
  OrderStatus,
  ShipmentStatus,
  UserRole,
} from '../generated/prisma/enums';

@Injectable()
export class ProviderService {
  constructor(private readonly prisma: PrismaService) {}

  // ==========================================
  // 1. STAFF MANAGEMENT
  // ==========================================

  // List all staff members for the provider store
  async getStaffMembers(providerId: string) {
    if (!providerId) throw new UnauthorizedException('Provider store identification required');

    return this.prisma.providerMember.findMany({
      where: { providerId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            isActive: true,
            createdAt: true,
          },
        },
      },
      orderBy: { id: 'desc' },
    });
  }

  // Create a new staff account and link to provider store
  async createStaffMember(providerId: string, dto: CreateStaffDto) {
    if (!providerId) throw new UnauthorizedException('Provider store identification required');
    if (!dto.email || !dto.name) {
      throw new BadRequestException('Staff name and email are required');
    }

    const email = dto.email.toLowerCase().trim();
    const rawPassword = dto.password?.trim() || 'Staff@123';
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    // Check if user already exists
    let user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          name: dto.name.trim(),
          email,
          password: hashedPassword,
          role: UserRole.PROVIDER_STAFF,
          isActive: true,
        },
      });
    } else {
      // If user exists, ensure they are assigned PROVIDER_STAFF role if not admin
      if (user.role === UserRole.USER) {
        await this.prisma.user.update({
          where: { id: user.id },
          data: { role: UserRole.PROVIDER_STAFF },
        });
      }
    }

    // Check if already a member of this provider store
    const existingMember = await this.prisma.providerMember.findFirst({
      where: { providerId, userId: user.id },
    });

    if (existingMember) {
      throw new BadRequestException('This user is already a staff ');
    }

    const member = await this.prisma.providerMember.create({
      data: {
        providerId,
        userId: user.id,
        role: dto.role?.trim() || 'PROVIDER_STAFF',
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            isActive: true,
            createdAt: true,
          },
        },
      },
    });

    return {
      message: 'Staff member added successfully',
      member,
      tempPasswordNotice: dto.password ? undefined : 'Temporary default password: Staff@123',
    };
  }

  // Update staff member
  async updateStaffMember(providerId: string, memberId: number, dto: UpdateStaffDto) {
    if (!providerId) throw new UnauthorizedException('Provider store identification required');

    const member = await this.prisma.providerMember.findFirst({
      where: { id: memberId, providerId },
      include: { user: true },
    });

    if (!member) {
      throw new NotFoundException('Staff member not found in your store');
    }

    if (dto.role) {
      await this.prisma.providerMember.update({
        where: { id: memberId },
        data: { role: dto.role.trim() },
      });
    }

    if (dto.name || dto.isActive !== undefined) {
      await this.prisma.user.update({
        where: { id: member.userId },
        data: {
          ...(dto.name && { name: dto.name.trim() }),
          ...(dto.isActive !== undefined && { isActive: dto.isActive }),
        },
      });
    }

    return this.prisma.providerMember.findUnique({
      where: { id: memberId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            isActive: true,
          },
        },
      },
    });
  }

  // Delete/remove staff member
  async deleteStaffMember(providerId: string, memberId: number) {
    if (!providerId) throw new UnauthorizedException('Provider store identification required');

    const member = await this.prisma.providerMember.findFirst({
      where: { id: memberId, providerId },
    });

    if (!member) {
      throw new NotFoundException('Staff member not found in your store');
    }

    await this.prisma.providerMember.delete({
      where: { id: memberId },
    });

    return { success: true, message: 'Staff member access removed from store' };
  }

  // ==========================================
  // 2. MOVE TO SHIPMENT & DISPATCH
  // ==========================================

  async moveToShipment(providerId: string, staffUserId: number, dto: CreateShipmentDto) {
    if (!providerId) throw new UnauthorizedException('Provider store identification required');

    const order = await this.prisma.order.findFirst({
      where: { id: dto.orderId, providerId },
    });

    if (!order) {
      throw new NotFoundException('Order not found or does not belong to your store');
    }

    // Generate tracking number if not explicitly passed
    const trackingNumber =
      dto.trackingNumber?.trim() ||
      `TRK-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    const carrier = dto.carrier?.trim() || 'Express';
    const initialLocation = dto.initialLocation?.trim() || 'Merchant Fulfillment Center';
    const note = dto.note?.trim() || 'Order accepted and handed to shipment department';

    // Create Shipment record
    const shipment = await this.prisma.shipment.create({
      data: {
        orderId: order.id,
        providerId,
        trackingNumber,
        carrier,
        assignedStaffId: dto.assignedStaffId || (staffUserId ? Number(staffUserId) : null),
        status: ShipmentStatus.DISPATCHED,
        currentLocation: initialLocation,
        logs: {
          create: {
            staffId: staffUserId ? Number(staffUserId) : null,
            status: ShipmentStatus.DISPATCHED,
            location: initialLocation,
            note,
          },
        },
      },
      include: {
        logs: true,
        order: {
          include: {
            user: { select: { id: true, name: true, email: true } },
            items: { include: { product: true } },
          },
        },
      },
    });

    // Update order status to SHIPPED
    await this.prisma.order.update({
      where: { id: order.id },
      data: { status: OrderStatus.SHIPPED },
    });

    return {
      message: 'Order moved to shipment department successfully',
      shipment,
    };
  }

  // ==========================================
  // 3. SHIPMENT CHECKPOINTS & TIMELINE LOGS
  // ==========================================

  // List all shipments for provider
  async getShipments(providerId: string, query: any = {}) {
    if (!providerId) throw new UnauthorizedException('Provider store identification required');

    const where: any = { providerId };
    if (query?.status) where.status = query.status;

    return this.prisma.shipment.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        assignedStaff: { select: { id: true, name: true, email: true } },
        order: {
          include: {
            user: { select: { id: true, name: true, email: true } },
            items: { include: { product: true } },
            address: true,
          },
        },
        logs: {
          orderBy: { createdAt: 'desc' },
          include: { staff: { select: { id: true, name: true, email: true } } },
        },
      },
    });
  }

  // Get single shipment detail with complete checkpoint timeline
  async getShipment(providerId: string, shipmentId: string) {
    if (!providerId) throw new UnauthorizedException('Provider store identification required');

    const shipment = await this.prisma.shipment.findFirst({
      where: { id: shipmentId, providerId },
      include: {
        assignedStaff: { select: { id: true, name: true, email: true } },
        order: {
          include: {
            user: { select: { id: true, name: true, email: true } },
            items: { include: { product: true } },
            address: true,
          },
        },
        logs: {
          orderBy: { createdAt: 'desc' },
          include: { staff: { select: { id: true, name: true, email: true } } },
        },
      },
    });

    if (!shipment) {
      throw new NotFoundException('Shipment record not found');
    }

    return shipment;
  }

  // Provider staff adds a checkpoint log ("Where order has reached")
  async addShipmentLog(
    providerId: string,
    staffUserId: number,
    shipmentId: string,
    dto: AddShipmentLogDto
  ) {
    if (!providerId) throw new UnauthorizedException('Provider store identification required');

    const shipment = await this.prisma.shipment.findFirst({
      where: { id: shipmentId, providerId },
    });

    if (!shipment) {
      throw new NotFoundException('Shipment not found or does not belong to your store');
    }

    // Create log entry
    const log = await this.prisma.shipmentLog.create({
      data: {
        shipmentId,
        staffId: staffUserId ? Number(staffUserId) : null,
        status: dto.status,
        location: dto.location?.trim() || null,
        note: dto.note?.trim() || null,
      },
      include: {
        staff: { select: { id: true, name: true, email: true } },
      },
    });

    // Update root shipment
    const updatedShipment = await this.prisma.shipment.update({
      where: { id: shipmentId },
      data: {
        status: dto.status,
        ...(dto.location && { currentLocation: dto.location.trim() }),
      },
      include: {
        assignedStaff: { select: { id: true, name: true, email: true } },
        order: {
          include: {
            user: { select: { id: true, name: true, email: true } },
            items: { include: { product: true } },
            address: true,
          },
        },
        logs: {
          orderBy: { createdAt: 'desc' },
          include: { staff: { select: { id: true, name: true, email: true } } },
        },
      },
    });

    // Synchronize parent Order status based on milestone
    if (dto.status === ShipmentStatus.DELIVERED) {
      await this.prisma.order.update({
        where: { id: shipment.orderId },
        data: { status: OrderStatus.DELIVERED },
      });
    } else if (dto.status === ShipmentStatus.RETURNED) {
      await this.prisma.order.update({
        where: { id: shipment.orderId },
        data: { status: OrderStatus.RETURNED },
      });
    } else if (dto.status === ShipmentStatus.REFUNDED) {
      await this.prisma.order.update({
        where: { id: shipment.orderId },
        data: { status: OrderStatus.REFUNDED },
      });
    }

    return {
      message: `Checkpoint logged: ${dto.status}`,
      log,
      shipment: updatedShipment,
    };
  }

  // ==========================================
  // 4. RETURN & CANCELLATION GOVERNANCE
  // ==========================================

  // Customer requests return or cancellation
  async requestReturnOrCancel(
    userId: number,
    orderId: string,
    type: 'CANCEL' | 'RETURN',
    reason?: string
  ) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order || order.userId !== userId) {
      throw new NotFoundException('Order not found');
    }

    const nextStatus =
      type === 'CANCEL' ? OrderStatus.CANCEL_REQUESTED : OrderStatus.RETURN_REQUESTED;

    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: nextStatus,
        returnReason: reason?.trim() || 'Customer requested return/cancellation',
      },
    });

    return {
      message: `${type === 'CANCEL' ? 'Cancellation' : 'Return'} request submitted for provider review`,
      order: updated,
    };
  }

  // Provider reviews & approves/rejects return/cancel request
  async approveReturnOrCancel(
    providerId: string,
    orderId: string,
    approved: boolean,
    decisionNote?: string
  ) {
    if (!providerId) throw new UnauthorizedException('Provider store identification required');

    const order = await this.prisma.order.findFirst({
      where: { id: orderId, providerId },
    });

    if (!order) {
      throw new NotFoundException('Order not found or does not belong to your store');
    }

    let nextStatus: OrderStatus;
    if (approved) {
      if (order.status === OrderStatus.CANCEL_REQUESTED) {
        nextStatus = OrderStatus.CANCELLED;
      } else {
        // Return approved: hands off to staff for physical package receipt & verification
        nextStatus = OrderStatus.RETURN_APPROVED;
      }
    } else {
      // Revert back to active state
      nextStatus = order.status === OrderStatus.CANCEL_REQUESTED ? OrderStatus.CONFIRMED : OrderStatus.SHIPPED;
    }

    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: { status: nextStatus },
      include: {
        user: { select: { id: true, name: true, email: true } },
        items: { include: { product: true } },
      },
    });

    return {
      message: approved ? 'Request approved successfully' : 'Request rejected by store provider',
      order: updated,
    };
  }

  // Provider staff processes physical receipt of returned package & marks refunded
  async processReturnReceipt(
    providerId: string,
    staffUserId: number,
    orderId: string,
    action: 'RETURNED' | 'REFUNDED',
    note?: string
  ) {
    if (!providerId) throw new UnauthorizedException('Provider store identification required');

    const order = await this.prisma.order.findFirst({
      where: { id: orderId, providerId },
      include: { shipment: true },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: action === 'REFUNDED' ? OrderStatus.REFUNDED : OrderStatus.RETURNED,
      },
    });

    // Also update shipment if existing
    if (order.shipment?.[0]) {
      const shipId = order.shipment[0].id;
      const shipStatus =
        action === 'REFUNDED' ? ShipmentStatus.REFUNDED : ShipmentStatus.RETURNED;

      await this.prisma.shipment.update({
        where: { id: shipId },
        data: { status: shipStatus },
      });

      await this.prisma.shipmentLog.create({
        data: {
          shipmentId: shipId,
          staffId: staffUserId ? Number(staffUserId) : null,
          status: shipStatus,
          location: 'Merchant Return Processing Hub',
          note: note || `Package received and processed by staff (${action})`,
        },
      });
    }

    return {
      message: `Return process completed: Marked as ${action}`,
      order: updated,
    };
  }
}
