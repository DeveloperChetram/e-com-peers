import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { UserService } from './user.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { RegisterProviderDto } from './dto/register-provider.dto';
import { SyncCartDto } from './dto/sync-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { CreateAddressDto, UpdateAddressDto } from './dto/address.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  async register(
    @Body() dto: RegisterUserDto,
    @Res({ passthrough: true }) response: Response
  ) {
    const result = await this.userService.register(dto);
    if (result.accessToken) {
      response.cookie('accessToken', result.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });
    }
    return result;
  }

  @Post('/register/provider')
  async registerProvider(
    @Body() dto: RegisterProviderDto,
    @Res({ passthrough: true }) response: Response
  ) {
    const result = await this.userService.registerProvider(dto);
    if (result.accessToken) {
      response.cookie('accessToken', result.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });
    }
    return result;
  }

  @Post('login')
  async login(
    @Body() dto: LoginUserDto,
    @Res({ passthrough: true }) response: Response
  ) {
    const result: any = await this.userService.login(dto);
    if (result?.accessToken) {
      response.cookie('accessToken', result.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });
    }
    return result;
  }

  @Get('profile')
  async getProfile(@Req() req: any) {
    const userId = req.user?.id;
    return this.userService.getProfile(userId);
  }

  @Patch('profile')
  async updateProfile(@Req() req: any, @Body() body: { name?: string }) {
    const userId = req.user?.id;
    return this.userService.updateProfile(userId, body);
  }

  // ─── Cart Routes ───────────────────────────────────────────────────────────

  @Get('cart')
  async getCart(@Req() req: any) {
    const userId = req.user?.id;
    return this.userService.getCart(userId);
  }

  @Post('cart/sync')
  async syncCart(@Req() req: any, @Body() dto: SyncCartDto) {
    const userId = req.user?.id;
    return this.userService.syncCart(userId, dto?.items);
  }

  @Patch('cart/item')
  async updateCartItem(@Req() req: any, @Body() dto: UpdateCartItemDto) {
    const userId = req.user?.id;
    return this.userService.updateCartItem(userId, dto?.productId, dto?.quantity);
  }

  // ─── Favorites / Wishlist Routes ──────────────────────────────────────────

  @Get('favorites')
  async getFavorites(@Req() req: any) {
    const userId = req.user?.id;
    return this.userService.getFavorites(userId);
  }

  @Post('favorites/:productId')
  async toggleFavorite(
    @Req() req: any,
    @Param('productId') productId: string
  ) {
    const userId = req.user?.id;
    return this.userService.toggleFavorite(userId, productId);
  }

  // ─── Address Routes ─────────────────────────────────────────────

  @Get('addresses')
  async getAddresses(@Req() req: any) {
    const userId = req.user?.id;
    return this.userService.getUserAddresses(userId);
  }

  @Post('addresses')
  async createAddress(@Req() req: any, @Body() dto: CreateAddressDto) {
    const userId = req.user?.id;
    return this.userService.createAddress(userId, dto);
  }

  @Patch('addresses/:id')
  async updateAddress(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateAddressDto
  ) {
    const userId = req.user?.id;
    return this.userService.updateAddress(userId, id, dto);
  }

  @Delete('addresses/:id')
  async deleteAddress(@Req() req: any, @Param('id') id: string) {
    const userId = req.user?.id;
    return this.userService.deleteAddress(userId, id);
  }
}
