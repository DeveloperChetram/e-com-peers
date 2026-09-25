import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { RegisterProviderDto } from './dto/register-provider.dto';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterUserDto) {
    // 1. Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
    });

    if (existingUser) {
      throw new ConflictException('User already exists with this email address');
    }

    // 2. Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(dto.password, saltRounds);

    // 3. Create new user in database
    const newUser = await this.prisma.user.create({
      data: {
        name: dto.name.trim(),
        email: dto.email.toLowerCase().trim(),
        password: hashedPassword,
        isActive: true,
      },
    });

    // 4. Generate JWT token
    const payload = {
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
    };

    const accessToken = this.jwtService.sign(payload);

    // 5. Omit password from response
    const { password, ...userWithoutPassword } = newUser;

    return {
      message: 'User registered successfully',
      accessToken,
      user: userWithoutPassword,
    };
  }


  async registerProvider(dto:RegisterProviderDto){
    const existingUser:any = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
    });
    const existingProvider = await this.prisma.provider.findUnique({
      where: { userId: existingUser?.id ? existingUser.id : 0},
    });
    
    if(existingUser && existingProvider){
      throw new ConflictException('Provider already exists with this email please login');
    }

    if (existingUser) {
      throw new ConflictException('User already exists with this email please login and convert to provider');
    }


    if (existingProvider) {
      throw new ConflictException('Provider already exists please login through provider login page');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    

    const newUser = await this.prisma.user.create({
      data:{
        email:dto.email,
        password:hashedPassword,
        name:dto.name,
        role:'PROVIDER'
      }
    })

    console.log(newUser)

    const newProvider = await this.prisma.provider.create({
      data:{
        userId:newUser.id,
        businessName:dto.businessName,
        description:dto.description,
        status:'PENDING'
      }
    })

    const { password, ...userWithoutPassword } = newUser;
    
    const payload = {
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
    };

    const accessToken = this.jwtService.sign(payload);
    
    
    return {
      message: 'Provider registered successfully',
      user: {...userWithoutPassword, ...newProvider},
      accessToken,
    };

  }

  async login(dto: LoginUserDto) {
    const email = dto.email.toLowerCase().trim();

    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { provider: true },
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

    // 1. Admin accounts cannot login via customer/provider login page
    if (user.role === 'ADMIN') {
      throw new UnauthorizedException(
        'Admin accounts cannot log in via the customer portal. Please use the Admin portal.',
      );
    }

    // 2. Provider login flow (from provider login page)
    if (dto.isProvider) {
      if (user.role !== 'PROVIDER' && !user.provider) {
        throw new UnauthorizedException(
          'No provider account found for this email. Please log in as a customer or register as a provider.',
        );
      }

      const payload = {
        id: user.id,
        email: user.email,
        role: user.role,
      };

      const accessToken = this.jwtService.sign(payload);
      const { password, ...userWithoutPassword } = user;

      return {
        message: 'Provider logged in successfully',
        accessToken,
        redirectTo: '/dashboard/provider',
        user: userWithoutPassword,
      };
    }

    // 3. User / Customer login flow (all users logging in here redirect to /dashboard/user)
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload);
    const { password, ...userWithoutPassword } = user;

    return {
      message: 'User logged in successfully',
      accessToken,
      redirectTo: '/dashboard/user',
      user: userWithoutPassword,
    };
  }

  async getProfile(userId: number) {
    if (!userId) {
      throw new UnauthorizedException('Authentication required');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        address: true,
        _count: {
          select: {
            order: true,
            faviorate: true,
            cart: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User profile not found');
    }

    return user;
  }

  async updateProfile(userId: number, data: { name?: string }) {
    if (!userId) {
      throw new UnauthorizedException('Authentication required');
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.name && { name: data.name.trim() }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
      },
    });

    return updated;
  }

  //cart 

  private async getOrCreateCart(userId: number) {
    let cart = await this.prisma.cart.findFirst({
      where: { userId },
    });
    if (!cart) {
      cart = await this.prisma.cart.create({
        data: { userId },
      });
    }
    return cart;
  }

  async getCart(userId: number) {
    if (!userId) throw new UnauthorizedException('Authentication required');

    const cart = await this.prisma.cart.findFirst({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                imageUrl: true,
                providerId: true,
                categoryId: true,
                slug: true,
              },
            },
          },
        },
      },
    });

    if (!cart) {
      return { items: [], totalItems: 0, totalPrice: 0 };
    }

    const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cart.items.reduce(
      (sum, item) => sum + item.quantity * (item.product?.price || 0),
      0
    );

    return {
      items: cart.items,
      totalItems,
      totalPrice,
    };
  }

  async syncCart(userId: number, items: { productId: string; quantity: number }[] = []) {
    if (!userId) throw new UnauthorizedException('Authentication required');

    const cart = await this.getOrCreateCart(userId);

 
    await this.prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    const validItems = items?.filter((i) => i?.productId && i?.quantity > 0) || [];
    if (validItems.length > 0) {
      await this.prisma.cartItem.createMany({
        data: validItems.map((item) => ({
          cartId: cart.id,
          productId: item.productId,
          quantity: item.quantity,
        })),
      });
    }

    return this.getCart(userId);
  }

  async updateCartItem(userId: number, productId: string, quantity: number) {
    if (!userId) throw new UnauthorizedException('Authentication required');
    if (!productId) throw new NotFoundException('Product ID is required');

    const cart = await this.getOrCreateCart(userId);

    const existingItem = await this.prisma.cartItem.findFirst({
      where: { cartId: cart.id, productId },
    });

    if (quantity <= 0) {
      if (existingItem) {
        await this.prisma.cartItem.delete({
          where: { id: existingItem.id },
        });
      }
    } else if (existingItem) {
      await this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity },
      });
    } else {
      await this.prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity,
        },
      });
    }

    return { success: true, message: 'Cart updated' };
  }

  // =========================
  // FAVORITES / WISHLIST
  // =========================

  async getFavorites(userId: number) {
    if (!userId) throw new UnauthorizedException('Authentication required');

    const favorites = await this.prisma.faviorate.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            category: true,
            provider: {
              select: {
                id: true,
                businessName: true,
              },
            },
          },
        },
      },
      orderBy: { id: 'desc' },
    });

    return favorites.map((f) => ({
      id: f.id,
      productId: f.productId,
      product: f.product,
    }));
  }

  async toggleFavorite(userId: number, productId: string) {
    if (!userId) throw new UnauthorizedException('Authentication required');
    if (!productId) throw new NotFoundException('Product ID is required');

    const existing = await this.prisma.faviorate.findFirst({
      where: { userId, productId },
    });

    if (existing) {
      await this.prisma.faviorate.delete({
        where: { id: existing.id },
      });
      return { isFavorite: false, productId, message: 'Removed from favorites' };
    } else {
      await this.prisma.faviorate.create({
        data: {
          userId,
          productId,
        },
      });
      return { isFavorite: true, productId, message: 'Added to favorites' };
    }
  }

  // =========================
  // ADDRESS MANAGEMENT
  // =========================

  async getUserAddresses(userId: number) {
    if (!userId) throw new UnauthorizedException('Authentication required');

    return this.prisma.address.findMany({
      where: { userId },
      orderBy: { id: 'desc' },
    });
  }

  async createAddress(
    userId: number,
    data: {
      street: string;
      city: string;
      state: string;
      zip: string;
      country: string;
    }
  ) {
    if (!userId) throw new UnauthorizedException('Authentication required');
    if (!data.street || !data.city || !data.zip) {
      throw new BadRequestException('Street, city, and zip code are required');
    }

    const address = await this.prisma.address.create({
      data: {
        userId,
        street: data.street.trim(),
        city: data.city.trim(),
        state: (data.state || '').trim(),
        zip: data.zip.trim(),
        country: (data.country || 'USA').trim(),
      },
    });

    return address;
  }

  async updateAddress(
    userId: number,
    addressId: string,
    data: {
      street?: string;
      city?: string;
      state?: string;
      zip?: string;
      country?: string;
    }
  ) {
    if (!userId) throw new UnauthorizedException('Authentication required');

    const address = await this.prisma.address.findFirst({
      where: { id: addressId, userId },
    });

    if (!address) {
      throw new NotFoundException('Address not found');
    }

    const updated = await this.prisma.address.update({
      where: { id: addressId },
      data: {
        ...(data.street && { street: data.street.trim() }),
        ...(data.city && { city: data.city.trim() }),
        ...(data.state && { state: data.state.trim() }),
        ...(data.zip && { zip: data.zip.trim() }),
        ...(data.country && { country: data.country.trim() }),
      },
    });

    return updated;
  }

  async deleteAddress(userId: number, addressId: string) {
    if (!userId) throw new UnauthorizedException('Authentication required');

    const address = await this.prisma.address.findFirst({
      where: { id: addressId, userId },
      include: { _count: { select: { order: true } } },
    });

    if (!address) {
      throw new NotFoundException('Address not found');
    }

    if (address._count.order > 0) {
      throw new BadRequestException('Cannot delete an address that is linked to existing orders');
    }

    await this.prisma.address.delete({
      where: { id: addressId },
    });

    return { success: true, message: 'Address removed successfully' };
  }
}