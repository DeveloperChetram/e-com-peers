import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FilterProductDto } from './dto/filter-product.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  private async getProviderId(user: any): Promise<string> {
    if (user?.provider?.id) return user.provider.id;
    if (user?.id) {
      const provider = await this.prisma.provider.findUnique({
        where: { userId: user.id },
      });
      if (provider) return provider.id;
    }
    throw new ForbiddenException('Provider account not found');
  }

  async createProduct(dto: CreateProductDto, user?: any, file?: any) {
    const providerId = await this.getProviderId(user);

    const category = await this.prisma.category.findUnique({
      where: { id: dto.categoryId },
    });
    if (!category) throw new NotFoundException('Category not found');

    const imageUrl = file
      ? `/uploads/products/${file.filename}`
      : (dto.imageUrl || '');

    const isPublished =
      dto.isPublished === true || dto.isPublished === 'true';

    return this.prisma.product.create({
      data: {
        name: dto.name,
        description: dto.description,
        price: Number(dto.price),
        imageUrl: imageUrl,
        slug: dto.slug || null,
        isPublished: isPublished,
        isApproved: false, // Requires admin approval
        category: {
          connect: { id: dto.categoryId },
        },
        provider: {
          connect: { id: providerId },
        },
      },
      include: {
        category: true,
        provider: true,
      },
    });
  }

  async getMyProducts(
    userId?: number,
    query?: {
      search?: string;
      categoryId?: string;
      status?: string;
    },
  ) {
    if (!userId) return [];
    const provider = await this.prisma.provider.findUnique({
      where: { userId },
    });
    if (!provider) return [];

    const where: any = {
      providerId: provider.id,
    };

    if (query?.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query?.categoryId) {
      where.categoryId = query.categoryId;
    }

    if (query?.status === 'published') {
      where.isPublished = true;
    } else if (query?.status === 'draft') {
      where.isPublished = false;
    } else if (query?.status === 'approved') {
      where.isApproved = true;
    } else if (query?.status === 'pending') {
      where.isApproved = false;
    }

    return this.prisma.product.findMany({
      where,
      include: {
        category: true,
        provider: true,
      },
      orderBy: { id: 'desc' },
    });
  }

  async getMyProductById(id: string, user: any) {
    const providerId = await this.getProviderId(user);

    const product = await this.prisma.product.findFirst({
      where: { id, providerId },
      include: {
        category: true,
        provider: true,
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found or access denied');
    }

    return product;
  }

  async updateProduct(
    id: string,
    dto: UpdateProductDto,
    user: any,
    file?: any,
  ) {
    const providerId = await this.getProviderId(user);

    const product = await this.prisma.product.findFirst({
      where: { id, providerId },
    });

    if (!product) {
      throw new NotFoundException('Product not found or access denied');
    }

    if (dto.categoryId) {
      const category = await this.prisma.category.findUnique({
        where: { id: dto.categoryId },
      });
      if (!category) throw new NotFoundException('Category not found');
    }

    const data: any = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.price !== undefined) data.price = Number(dto.price);
    if (dto.slug !== undefined) data.slug = dto.slug;
    if (dto.categoryId !== undefined) {
      data.category = { connect: { id: dto.categoryId } };
    }
    if (dto.isPublished !== undefined) {
      data.isPublished =
        dto.isPublished === true || dto.isPublished === 'true';
    }
    if (file) {
      data.imageUrl = `/uploads/products/${file.filename}`;
    }

    return this.prisma.product.update({
      where: { id },
      data,
      include: {
        category: true,
        provider: true,
      },
    });
  }

  async togglePublish(id: string, user: any, isPublished?: boolean) {
    const providerId = await this.getProviderId(user);

    const product = await this.prisma.product.findFirst({
      where: { id, providerId },
    });

    if (!product) {
      throw new NotFoundException('Product not found or access denied');
    }

    const targetStatus =
      isPublished !== undefined ? isPublished : !product.isPublished;

    const updated = await this.prisma.product.update({
      where: { id },
      data: { isPublished: targetStatus },
      include: {
        category: true,
      },
    });

    return {
      success: true,
      message: targetStatus
        ? 'Product published to store catalog'
        : 'Product moved to draft mode',
      product: updated,
    };
  }

  async deleteProduct(id: string, user: any) {
    const providerId = await this.getProviderId(user);

    const product = await this.prisma.product.findFirst({
      where: { id, providerId },
    });

    if (!product) {
      throw new NotFoundException('Product not found or access denied');
    }

    // Check if product is part of any orders
    const orderItemsCount = await this.prisma.orderItem.count({
      where: { productId: id },
    });
    if (orderItemsCount > 0) {
      throw new BadRequestException(
        'Cannot delete product that has customer order history. You can unpublish it instead.',
      );
    }

    // Remove cart items and favorites associated with this product
    await this.prisma.cartItem.deleteMany({ where: { productId: id } });
    await this.prisma.faviorate.deleteMany({ where: { productId: id } });

    await this.prisma.product.delete({ where: { id } });

    return {
      success: true,
      message: 'Product deleted successfully',
    };
  }

  async getProducts() {
    return this.prisma.product.findMany({
      where:{
        isApproved: true,
        isPublished: true,
      },
      include: {
        category: true,
        provider: true,
      },
    });
  }

  async getProductById(id: string) {
    const product = await this.prisma.product.findFirst({
      where: {
        id,
        isApproved: true,
        isPublished: true,
      },
      include: {
        category: true,
        provider: true,
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found or unavailable');
    }

    return product;
  }

  async filterProducts(dto: FilterProductDto) {
    const isPaginated = dto.page !== undefined || dto.limit !== undefined;
    const page = Number(dto.page) || 1;
    const limit = Number(dto.limit) || 10;
    const skip = (page - 1) * limit;

   const where: any = {
  // Only approved products
  isApproved: true,

  // Only published products
  isPublished: true,

  ...(dto.name && {
    name: {
      contains: dto.name,
      mode: 'insensitive' as const,
    },
  }),

  ...(dto.categoryId && {
    categoryId: dto.categoryId,
  }),

  ...(dto.providerId && {
    providerId: dto.providerId,
  }),

  ...((dto.minPrice !== undefined || dto.maxPrice !== undefined) && {
    price: {
      ...(dto.minPrice !== undefined && {
        gte: Number(dto.minPrice),
      }),
      ...(dto.maxPrice !== undefined && {
        lte: Number(dto.maxPrice),
      }),
    },
  }),
};

    if (!isPaginated) {
      const data = await this.prisma.product.findMany({
        where,
        include: { category: true, provider: true },
        orderBy: { price: 'asc' },
        
      });
      return { data, meta: { total: data.length } };
    }

    const [data, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: { category: true, provider: true },
        orderBy: { price: 'asc' },
        skip,
        take: limit,
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1,
      },
    };
  }
}