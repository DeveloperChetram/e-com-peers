import {
  Body,
  Controller,
  Delete,
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

  // ==========================================
  // PROVIDER ORDER ROUTES
  // (Defined before :id to prevent route shadowing)
  // ==========================================

  // GET /orders/provider/all or /orders/provider - List all orders for the authenticated provider
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

  // GET /orders/provider/:id - Get specific order details for provider
  @Get('provider/:id')
  async getProviderOrder(@Req() req: any, @Param('id') id: string) {
    const providerId = req.user?.provider?.id;
    return this.orderService.getProviderOrder(providerId, id);
  }

  // PATCH /orders/provider/:id/status - Update order status (CONFIRMED, SHIPPED, DELIVERED, CANCELLED)
  @Patch('provider/:id/status')
  async updateProviderOrderStatus(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    const providerId = req.user?.provider?.id;
    return this.orderService.updateProviderOrderStatus(providerId, id, dto.status);
  }

  // ==========================================
  // ADMIN ORDER ROUTES
  // (Defined before :id to prevent route shadowing)
  // ==========================================

  // GET /orders/admin/all or /orders/admin - List all orders across platform with filters
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

  // PATCH /orders/:id/cancel - Cancel pending order
  @Patch(':id/cancel')
  async cancelOrder(@Req() req: any, @Param('id') id: string) {
    const userId = req.user?.id;
    return this.orderService.cancelOrder(userId, id);
  }
}
