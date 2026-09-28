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
import { OrderService } from './order.service';
import { PlaceOrderDto } from './dto/place-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get('provider/all')
  async getProviderOrdersAll(@Req() req: any, @Query() query: any) {
    const providerId = req.user?.provider?.id;
    return this.orderService.getProviderOrders(providerId, query);
  }

  @Get('provider')
  async getProviderOrders(@Req() req: any, @Query() query: any) {
    const providerId = req.user?.provider?.id;
    return this.orderService.getProviderOrders(providerId, query);
  }

  @Get('provider/:id')
  async getProviderOrder(@Req() req: any, @Param('id') id: string) {
    const providerId = req.user?.provider?.id;
    return this.orderService.getProviderOrder(providerId, id);
  }

  @Patch('provider/:id/status')
  async updateProviderOrderStatus(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    if (req.user?.role === 'PROVIDER_STAFF' || req.user?.isStaff) {
      throw new ForbiddenException(
        'Provider staff cannot accept or reject orders. Only the store provider can perform this action.',
      );
    }
    const providerId = req.user?.provider?.id;
    return this.orderService.updateProviderOrderStatus(
      providerId,
      id,
      dto.status,
    );
  }

  @Get('admin/all')
  async getAdminOrdersAll(@Query() query: any) {
    return this.orderService.getAdminOrders(query);
  }

  @Get('admin')
  async getAdminOrders(@Query() query: any) {
    return this.orderService.getAdminOrders(query);
  }

  // GET /orders/admin/:id - Get any order detail
  @Get('admin/:id')
  async getAdminOrder(@Param('id') id: string) {
    return this.orderService.getAdminOrder(id);
  }

  // PATCH /orders/admin/:id/status - Admin status override
  @Patch('admin/:id/status')
  async updateAdminOrderStatus(
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.orderService.updateAdminOrderStatus(id, dto.status);
  }

  // DELETE /orders/admin/:id - Admin deletes order
  @Delete('admin/:id')
  async deleteAdminOrder(@Param('id') id: string) {
    return this.orderService.deleteAdminOrder(id);
  }

  // ==========================================
  // CUSTOMER / USER ORDER ROUTES
  // ==========================================

  // POST /orders - Place a new order
  @Post()
  async placeOrder(@Req() req: any, @Body() dto: PlaceOrderDto) {
    const userId = req.user?.id;
    return this.orderService.placeOrder(userId, dto);
  }

  // GET /orders - Get current customer's order history (paginated)
  @Get()
  async getMyOrders(@Req() req: any, @Query() query: any) {
    const userId = req.user?.id;
    return this.orderService.getMyOrders(userId, query);
  }

  // GET /orders/:id - Get customer order details
  @Get(':id')
  async getOrder(@Req() req: any, @Param('id') id: string) {
    const userId = req.user?.id;
    return this.orderService.getOrder(userId, id);
  }

  // PATCH /orders/:id/cancel - Direct cancellation for pending orders
  @Patch(':id/cancel')
  async cancelOrder(@Req() req: any, @Param('id') id: string) {
    const userId = req.user?.id;
    return this.orderService.cancelOrder(userId, id);
  }

  // POST /orders/:id/request-cancel - Customer requests cancellation with reason
  @Post(':id/request-cancel')
  async requestCancel(
    @Req() req: any,
    @Param('id') id: string,
    @Body('reason') reason?: string,
  ) {
    const userId = req.user?.id;
    return this.orderService.requestReturnOrCancel(
      userId,
      id,
      'CANCEL',
      reason,
    );
  }

  // POST /orders/:id/request-return - Customer requests return with reason
  @Post(':id/request-return')
  async requestReturn(
    @Req() req: any,
    @Param('id') id: string,
    @Body('reason') reason?: string,
  ) {
    const userId = req.user?.id;
    return this.orderService.requestReturnOrCancel(
      userId,
      id,
      'RETURN',
      reason,
    );
  }

  // GET /orders/:id/tracking - Customer views shipment tracking timeline
  @Get(':id/tracking')
  async getOrderTracking(@Req() req: any, @Param('id') id: string) {
    const userId = req.user?.id;
    return this.orderService.getOrderTracking(userId, id);
  }
}
