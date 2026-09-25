import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole } from '../generated/prisma/enums';
import { LoginUserDto } from '../user/dto/login-user.dto';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  // =========================
  // AUTH
  // =========================

  async login(dto: LoginUserDto) {
    const email = dto.email.toLowerCase().trim();

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Your account is deactivated');
    }

    if (user.role !== UserRole.ADMIN) {
      throw new UnauthorizedException('Access denied: Admin accounts only');
    }

    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload);
    const { password, ...userWithoutPassword } = user;

    return {
      message: 'Admin logged in successfully',
      accessToken,
      redirectTo: '/dashboard/admin',
      user: userWithoutPassword,
    };
  }

  // =========================
  // STATS
  // =========================

  async getStats() {
    const [users, providers, products, orders] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.provider.count(),
      this.prisma.product.count(),
      this.prisma.order.count(),
    ]);

    return { users, providers, products, orders };
  }

  // =========================
  // USERS
  // =========================

  async getUsers(query: any) {
    const page = Number(query?.page) || 1;
    const limit = Number(query?.limit) || 20;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query?.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query?.role) {
      where.role = query.role;
    }

    if (query?.isActive !== undefined) {
      where.isActive = query.isActive === 'true' || query.isActive === true;
    }

    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { id: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
          createdAt: true,
          provider: {
            select: {
              id: true,
              businessName: true,
              status: true,
            },
          },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getUser(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        provider: true,
        address: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateUserStatus(id: number, isActive: boolean) {
    return this.prisma.user.update({
      where: { id },
      data: { isActive },
    });
  }

  async updateUserRole(id: number, role: UserRole) {
    return this.prisma.user.update({
      where: { id },
      data: { role },
    });
  }

  async deleteUser(id: number) {
    return this.prisma.user.delete({
      where: { id },
    });
  }

  // =========================
  // PROVIDERS
  // =========================

  private getProviderWhere(id: string | number) {
    const numericId = Number(id);
    if (!isNaN(numericId) && numericId > 0) {
      return {
        OR: [{ id: String(id) }, { userId: numericId }],
      };
    }
    return { id: String(id) };
  }

  async getProviders(query: any) {
    const page = Number(query?.page) || 1;
    const limit = Number(query?.limit) || 20;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query?.search) {
      where.OR = [
        { businessName: { contains: query.search, mode: 'insensitive' } },
        { user: { name: { contains: query.search, mode: 'insensitive' } } },
        { user: { email: { contains: query.search, mode: 'insensitive' } } },
      ];
    }

    if (query?.status) {
      where.status = query.status;
    }

    if (query?.isActive !== undefined) {
      where.user = {
        isActive: query.isActive === 'true' || query.isActive === true,
      };
    }

    const [data, total] = await Promise.all([
      this.prisma.provider.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
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
      }),
      this.prisma.provider.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getProvider(id: string | number) {
    const provider = await this.prisma.provider.findFirst({
      where: this.getProviderWhere(id),
      include: {
        user: true,
        products: true,
      },
    });

    if (!provider) {
      throw new NotFoundException('Provider not found');
    }

    return provider;
  }

  async updateProviderStatus(
    id: string | number,
    isActive?: boolean,
    status?: string,
  ) {
    const provider = await this.prisma.provider.findFirst({
      where: this.getProviderWhere(id),
    });

    if (!provider) {
      throw new NotFoundException('Provider not found');
    }

    if (isActive !== undefined) {
      await this.prisma.user.update({
        where: { id: provider.userId },
        data: { isActive },
      });
    }

    if (status) {
      return this.prisma.provider.update({
        where: { id: provider.id },
        data: { status },
      });
    }

    return provider;
  }

  async approveProvider(id: string | number) {
    const provider = await this.prisma.provider.findFirst({
      where: this.getProviderWhere(id),
    });

    if (!provider) {
      throw new NotFoundException('Provider not found');
    }

    await this.prisma.user.update({
      where: { id: provider.userId },
      data: { role: UserRole.PROVIDER },
    });

    return this.prisma.provider.update({
      where: { id: provider.id },
      data: { status: 'APPROVED' },
    });
  }

  async rejectProvider(id: string | number) {
    const provider = await this.prisma.provider.findFirst({
      where: this.getProviderWhere(id),
    });

    if (!provider) {
      throw new NotFoundException('Provider not found');
    }

    return this.prisma.provider.update({
      where: { id: provider.id },
      data: { status: 'REJECTED' },
    });
  }

  async deleteProvider(id: string | number) {
    const provider = await this.prisma.provider.findFirst({
      where: this.getProviderWhere(id),
    });

    if (!provider) {
      throw new NotFoundException('Provider not found');
    }

    // Delete only provider profile, keep history, and change user role to USER
    await this.prisma.provider.delete({
      where: { id: provider.id },
    });

    await this.prisma.user.update({
      where: { id: provider.userId },
      data: { role: UserRole.USER },
    });

    return { message: 'Provider profile deleted successfully' };
  }

  // products

  async getProducts(query: any) {
    const page = Number(query?.page) || 1;
    const limit = Number(query?.limit) || 20;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query?.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query?.isApproved !== undefined) {
      where.isApproved = query.isApproved === 'true' || query.isApproved === true;
    }

    if (query?.isPublished !== undefined) {
      where.isPublished = query.isPublished === 'true' || query.isPublished === true;
    }

    if (query?.categoryId) {
      where.categoryId = query.categoryId;
    }

    const [data, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { id: 'desc' },
        include: {
          category: true,
          provider: true,
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getProduct(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        provider: true,
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async approveProduct(id: string) {
    return this.prisma.product.update({
      where: { id },
      data: { isApproved: true },
    });
  }

  async rejectProduct(id: string) {
    return this.prisma.product.update({
      where: { id },
      data: { isApproved: false, isPublished: false },
    });
  }

  async deleteProduct(id: string) {
    return this.prisma.product.delete({
      where: { id },
    });
  }

  // =========================
  // CATEGORIES
  // =========================

  async getCategories() {
    return this.prisma.category.findMany({
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async getCategory(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async getCategoryProducts(id: string, query?: any) {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const where: any = { categoryId: id };

    if (query?.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query?.isApproved !== undefined) {
      where.isApproved = query.isApproved === 'true' || query.isApproved === true;
    }

    if (query?.isPublished !== undefined) {
      where.isPublished = query.isPublished === 'true' || query.isPublished === true;
    }

    const products = await this.prisma.product.findMany({
      where,
      orderBy: { id: 'desc' },
      include: {
        provider: {
          select: {
            id: true,
            businessName: true,
          },
        },
        category: true,
      },
    });

    return {
      category,
      products,
      total: products.length,
    };
  }

  async createCategory(dto: { name: string; slug?: string }) {
    if (!dto.name) {
      throw new BadRequestException('Category name is required');
    }

    const generatedSlug = dto.slug?.trim() || dto.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    return this.prisma.category.create({
      data: {
        name: dto.name.trim(),
        slug: generatedSlug || 'category',
      },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });
  }

  async updateCategory(id: string, dto: { name?: string; slug?: string }) {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const data: any = {};
    if (dto.name !== undefined) data.name = dto.name.trim();
    if (dto.slug !== undefined) data.slug = dto.slug.trim();

    return this.prisma.category.update({
      where: { id },
      data,
      include: {
        _count: {
          select: { products: true },
        },
      },
    });
  }

  async deleteCategory(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const productsCount = await this.prisma.product.count({
      where: { categoryId: id },
    });

    if (productsCount > 0) {
      throw new BadRequestException(
        `Cannot delete category "${category.name}" because it contains ${productsCount} product(s). Please reassign or delete the products first.`
      );
    }

    await this.prisma.category.delete({
      where: { id },
    });

    return { message: 'Category deleted successfully' };
  }
}