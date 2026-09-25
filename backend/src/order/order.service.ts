import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PlaceOrderDto } from './dto/place-order.dto';
import { OrderStatus } from '../generated/prisma/enums';

@Injectable()
export class OrderService {
  constructor(private readonly prisma: PrismaService) {}

  // ==========================================
  // CUSTOMER / USER ORDER METHODS
  // ==========================================

  // 1. Place a new order
  async placeOrder(userId: number, dto: PlaceOrderDto) {
    if (!userId) {
      throw new UnauthorizedException('Authentication required to place an order');
    }

    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('Order must contain at least one item');
    }

    // Fetch products being ordered
    const productIds = dto.items.map((i) => i.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
      include: { provider: true },
    });

    if (products.length === 0) {
      throw new BadRequestException('Selected products could not be found');
    }

    // Resolve address
    let address = dto.addressId
      ? await this.prisma.address.findUnique({ where: { id: dto.addressId } })
      : null;

    if (!address) {
      address = await this.prisma.address.findFirst({
        where: { userId },
      });
    }

    if (!address) {
      // Create address if none exists
      address = await this.prisma.address.create({
        data: {
          userId,
          street: dto.address?.street || '123 Main St',
          city: dto.address?.city || 'New York',
          state: dto.address?.state || 'NY',
          zip: dto.address?.zip || '10001',
          country: dto.address?.country || 'USA',
        },
      });
    }

    const addressSnapshot = JSON.stringify({
      id: address.id,
      street: address.street,
      city: address.city,
      state: address.state,
      zip: address.zip,
      country: address.country,
      formatted: `${address.street}, ${address.city}, ${address.state} ${address.zip}, ${address.country}`,
    });

    const addressDetail = dto.addressDetail || addressSnapshot;

    // Resolve provider ID
    let providerId =
      dto.providerId ||
      products.find((p) => p.providerId)?.providerId ||
      products[0]?.providerId;

    if (!providerId) {
      const anyProvider = await this.prisma.provider.findFirst();
      if (anyProvider) {
        providerId = anyProvider.id;
      } else {
        // Fallback: create default platform provider if none exists
        const defaultProvider = await this.prisma.provider.create({
          data: {
            userId,
            businessName: 'E-Com Direct',
            isVerified: true,
          },
        });
        providerId = defaultProvider.id;
      }
    }

    // Create Order and OrderItems in database
    const order = await this.prisma.order.create({
      data: {
        userId,
        providerId,
        addressId: address.id,
        addressDetail,
        status: OrderStatus.PENDING,
        items: {
          create: dto.items.map((item) => {
            const product = products.find((p) => p.id === item.productId);
            const snapshot = JSON.stringify({
              id: product?.id || item.productId,
              name: product?.name || 'Product',
              price: product?.price || 0,
              imageUrl: product?.imageUrl || '',
            });
            return {
              productId: item.productId,
              quantity: item.quantity,
              productDetail: snapshot,
            };
          }),
        },
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                imageUrl: true,
                slug: true,
              },
            },
          },
        },
        provider: {
          select: {
            id: true,
            businessName: true,
          },
        },
        address: true,
      },
    });

    // Clear the ordered products from the user's cart in DB
    const cart = await this.prisma.cart.findFirst({ where: { userId } });
    if (cart) {
      await this.prisma.cartItem.deleteMany({
        where: {
          cartId: cart.id,
          productId: { in: productIds },
        },
      });
    }

    return order;
  }

  // 2. Get customer's orders (paginated)
  async getMyOrders(userId: number, query: any = {}) {
    if (!userId) {
      throw new UnauthorizedException('Authentication required');
    }

    const page = Math.max(1, Number(query?.page) || 1);
    const limit = Math.max(1, Number(query?.limit) || 10);
    const skip = (page - 1) * limit;

    const where: any = { userId };
    if (query?.status) {
      where.status = query.status;
    }

    const [data, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { id: 'desc' },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  price: true,
                  imageUrl: true,
                  slug: true,
                },
              },
            },
          },
          provider: {
            select: {
              id: true,
              businessName: true,
            },
          },
          address: true,
        },
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
    };
  }

  // 3. Get single order detail for customer
  async getOrder(userId: number, orderId: string) {
    if (!userId) {
      throw new UnauthorizedException('Authentication required');
    }

    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                imageUrl: true,
                slug: true,
              },
            },
          },
        },
        provider: {
          select: {
            id: true,
            businessName: true,
          },
        },
        address: true,
        shipment: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.userId !== userId) {
      throw new ForbiddenException('You do not have access to this order');
    }

    return order;
  }

  // 4. Cancel order (only if PENDING)
  async cancelOrder(userId: number, orderId: string) {
    if (!userId) {
      throw new UnauthorizedException('Authentication required');
    }

    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.userId !== userId) {
      throw new ForbiddenException('You do not have permission to cancel this order');
    }

    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException(
        `Cannot cancel order with status "${order.status}". Only pending orders can be cancelled.`
      );
    }

    const updatedOrder = await this.prisma.order.update({
      where: { id: orderId },
      data: { status: OrderStatus.CANCELLED },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        provider: true,
        address: true,
      },
    });

    return {
      message: 'Order cancelled successfully',
      order: updatedOrder,
    };
  }

  // ==========================================
  // PROVIDER ORDER METHODS
  // ==========================================

  // 1. Get all orders for a specific provider
  async getProviderOrders(providerId: string, query: any = {}) {
    if (!providerId) {
      throw new UnauthorizedException('Provider identification required');
    }

    const page = Math.max(1, Number(query?.page) || 1);
    const limit = Math.max(1, Number(query?.limit) || 10);
    const skip = (page - 1) * limit;

    const where: any = { providerId };
    if (query?.status) {
      where.status = query.status;
    }

    const [data, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { id: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          items: {
            include: {
              product: true,
            },
          },
          address: true,
          shipment: true,
        },
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // 2. Get single order detail for provider
  async getProviderOrder(providerId: string, orderId: string) {
    if (!providerId) {
      throw new UnauthorizedException('Provider identification required');
    }

    const order = await this.prisma.order.findFirst({
      where: { id: orderId, providerId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        items: {
          include: {
            product: true,
          },
        },
        address: true,
        shipment: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found or does not belong to your store');
    }

    return order;
  }

  // 3. Provider updates order status (e.g. CONFIRMED, SHIPPED, DELIVERED, CANCELLED)
  async updateProviderOrderStatus(
    providerId: string,
    orderId: string,
    status: OrderStatus
  ) {
    if (!providerId) {
      throw new UnauthorizedException('Provider identification required');
    }

    const existingOrder = await this.prisma.order.findFirst({
      where: { id: orderId, providerId },
    });

    if (!existingOrder) {
      throw new NotFoundException('Order not found or does not belong to your store');
    }

    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        address: true,
      },
    });

    return {
      message: `Order status updated to ${status}`,
      order: updated,
    };
  }

  // ==========================================
  // ADMIN ORDER METHODS
  // ==========================================

  // 1. Get all orders across platform
  async getAdminOrders(query: any = {}) {
    const page = Math.max(1, Number(query?.page) || 1);
    const limit = Math.max(1, Number(query?.limit) || 20);
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query?.status && query.status !== 'ALL') {
      where.status = query.status;
    }

    if (query?.providerId) {
      where.providerId = query.providerId;
    }

    if (query?.userId) {
      where.userId = Number(query.userId);
    }

    if (query?.search) {
      where.OR = [
        { id: { contains: query.search, mode: 'insensitive' } },
        { user: { name: { contains: query.search, mode: 'insensitive' } } },
        { user: { email: { contains: query.search, mode: 'insensitive' } } },
        { provider: { businessName: { contains: query.search, mode: 'insensitive' } } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { id: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          provider: {
            select: {
              id: true,
              businessName: true,
            },
          },
          items: {
            include: {
              product: true,
            },
          },
          address: true,
          shipment: true,
        },
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // 2. Get any order detail for admin
  async getAdminOrder(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: true,
        provider: true,
        items: {
          include: {
            product: true,
          },
        },
        address: true,
        shipment: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  // 3. Admin status override
  async updateAdminOrderStatus(orderId: string, status: OrderStatus) {
    const existing = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!existing) {
      throw new NotFoundException('Order not found');
    }

    return this.prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: {
        user: true,
        provider: true,
        items: {
          include: {
            product: true,
          },
        },
        address: true,
      },
    });
  }

  // 4. Admin deletes order
  async deleteAdminOrder(orderId: string) {
    const existing = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!existing) {
      throw new NotFoundException('Order not found');
    }

    // Delete child rows first (items, shipment)
    await this.prisma.orderItem.deleteMany({
      where: { orderId },
    });

    await this.prisma.shipment.deleteMany({
      where: { orderId },
    });

    await this.prisma.order.delete({
      where: { id: orderId },
    });

    return { message: 'Order deleted successfully' };
  }
}
