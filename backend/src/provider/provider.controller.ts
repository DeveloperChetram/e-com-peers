import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { ProviderService } from './provider.service';
import { CreateStaffDto, UpdateStaffDto } from './dto/staff.dto';
import { AddShipmentLogDto, CreateShipmentDto } from './dto/shipment.dto';

@Controller('provider')
export class ProviderController {
  constructor(private readonly providerService: ProviderService) {}

  // ==========================================
  // 1. STAFF MANAGEMENT (Provider Owner Only)
  // ==========================================

  @Get('staff')
  async getStaff(@Req() req: any) {
    if (req.user?.role === 'PROVIDER_STAFF' || req.user?.isStaff) {
      throw new ForbiddenException(
        'Provider staff cannot manage team staff. Only the store provider can access this.',
      );
    }
    const providerId = req.user?.provider?.id;
    return this.providerService.getStaffMembers(providerId);
  }

  @Post('staff')
  async createStaff(@Req() req: any, @Body() dto: CreateStaffDto) {
    if (req.user?.role === 'PROVIDER_STAFF' || req.user?.isStaff) {
      throw new ForbiddenException(
        'Provider staff cannot create staff members. Only the store provider can perform this action.',
      );
    }
    const providerId = req.user?.provider?.id;
    return this.providerService.createStaffMember(providerId, dto);
  }

  @Patch('staff/:id')
  async updateStaff(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateStaffDto,
  ) {
    if (req.user?.role === 'PROVIDER_STAFF' || req.user?.isStaff) {
      throw new ForbiddenException(
        'Provider staff cannot update staff members.',
      );
    }
    const providerId = req.user?.provider?.id;
    return this.providerService.updateStaffMember(providerId, Number(id), dto);
  }

  @Delete('staff/:id')
  async deleteStaff(@Req() req: any, @Param('id') id: string) {
    if (req.user?.role === 'PROVIDER_STAFF' || req.user?.isStaff) {
      throw new ForbiddenException(
        'Provider staff cannot delete staff members.',
      );
    }
    const providerId = req.user?.provider?.id;
    return this.providerService.deleteStaffMember(providerId, Number(id));
  }

  // ==========================================
  // 2. MOVE TO SHIPMENT DEPART (Provider Owner Only)
  // ==========================================

  @Post('shipments/move')
  async moveToShipment(@Req() req: any, @Body() dto: CreateShipmentDto) {
    if (req.user?.role === 'PROVIDER_STAFF' || req.user?.isStaff) {
      throw new ForbiddenException(
        'Provider staff cannot move orders to shipment department. Only the store provider can perform this action.',
      );
    }
    const providerId = req.user?.provider?.id;
    const staffUserId = req.user?.id;
    return this.providerService.moveToShipment(providerId, staffUserId, dto);
  }

  // ==========================================
  // 3. SHIPMENT CHECKPOINTS & TIMELINE (Staff & Provider)
  // ==========================================

  @Get('shipments')
  async getShipments(@Req() req: any, @Query() query: any) {
    const providerId = req.user?.provider?.id;
    return this.providerService.getShipments(providerId, query);
  }

  @Get('shipments/:id')
  async getShipment(@Req() req: any, @Param('id') id: string) {
    const providerId = req.user?.provider?.id;
    return this.providerService.getShipment(providerId, id);
  }

  @Post('shipments/:id/logs')
  async addShipmentLog(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: AddShipmentLogDto,
  ) {
    const providerId = req.user?.provider?.id;
    const staffUserId = req.user?.id;
    return this.providerService.addShipmentLog(
      providerId,
      staffUserId,
      id,
      dto,
    );
  }

  // ==========================================
  // 4. RETURN & CANCELLATION APPROVAL WORKFLOW
  // ==========================================

  // Provider approves / rejects return or cancellation (Provider Owner Only)
  @Patch('orders/:id/approve-return')
  async approveReturn(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: { approved: boolean; note?: string },
  ) {
    if (req.user?.role === 'PROVIDER_STAFF' || req.user?.isStaff) {
      throw new ForbiddenException(
        'Provider staff cannot approve or reject return/cancellation requests. Only the store provider can perform this action.',
      );
    }
    const providerId = req.user?.provider?.id;
    return this.providerService.approveReturnOrCancel(
      providerId,
      id,
      body.approved,
      body.note,
    );
  }

  // Provider staff processes physically received return goods & marks refunded (Staff & Provider)
  @Patch('orders/:id/process-return')
  async processReturn(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: { action: 'RETURNED' | 'REFUNDED'; note?: string },
  ) {
    const providerId = req.user?.provider?.id;
    const staffUserId = req.user?.id;
    return this.providerService.processReturnReceipt(
      providerId,
      staffUserId,
      id,
      body.action,
      body.note,
    );
  }
}
