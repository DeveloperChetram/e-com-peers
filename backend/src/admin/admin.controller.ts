import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { AdminService } from './admin.service';
import { UserRole } from '../generated/prisma/enums';
import { LoginUserDto } from '../user/dto/login-user.dto';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('login')
  async login(
    @Body() dto: LoginUserDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result: any = await this.adminService.login(dto);
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

  @Get('stats')
  getStats() {
    return this.adminService.getStats();
  }


  @Get('users')
  getUsers(@Query() query: any) {
    return this.adminService.getUsers(query);
  }

  @Get('users/:id')
  getUser(@Param('id') id: string) {
    return this.adminService.getUser(Number(id));
  }


  @Patch('users/:id/status')
  updateUserStatus(
    @Param('id') id: string,
    @Body('isActive') isActive: boolean,
  ) {
    return this.adminService.updateUserStatus(Number(id), isActive);
  }

  @Patch('users/:id/role')
  updateUserRole(
    @Param('id') id: string,
    @Body('role') role: UserRole,
  ) {
    return this.adminService.updateUserRole(Number(id), role);
  }

  @Delete('users/:id')
  deleteUser(@Param('id') id: string) {
    return this.adminService.deleteUser(Number(id));
  }

  // providers

@Get('providers')
  getProviders(@Query() query: any) {
    return this.adminService.getProviders(query);
  }

  @Get('providers/:id')
  getProvider(@Param('id') id: string) {
    return this.adminService.getProvider(id);
  }
  @Patch('providers/:id/status')
  updateProviderStatus(
    @Param('id') id: string,
    @Body('isActive') isActive?: boolean,
    @Body('status') status?: string,
  ) {
    return this.adminService.updateProviderStatus(id, isActive, status);
  }

  @Patch('providers/:id/approve')
  approveProvider(@Param('id') id: string) {
    return this.adminService.approveProvider(id);
  }
  @Patch('providers/:id/reject')
  rejectProvider(@Param('id') id: string) {
    return this.adminService.rejectProvider(id);
  }

  @Delete('providers/:id')
  deleteProvider(@Param('id') id: string) {
    return this.adminService.deleteProvider(id);
  }

  // products


  @Get('products')
  getProducts(@Query() query: any) {
    return this.adminService.getProducts(query);
  }
  @Get('products/:id')
  getProduct(@Param('id') id: string) {
    return this.adminService.getProduct(id);
  }

  @Patch('products/:id/approve')
  approveProduct(@Param('id') id: string) {
    return this.adminService.approveProduct(id);
  }

  @Patch('products/:id/reject')
  rejectProduct(@Param('id') id: string) {
    return this.adminService.rejectProduct(id);
  }
  @Delete('products/:id')
  deleteProduct(@Param('id') id: string) {
    return this.adminService.deleteProduct(id);
  }

  // categories

  @Get('categories')
  getCategories() {
    return this.adminService.getCategories();
  }
  @Get('categories/:id')
  getCategory(@Param('id') id: string) {
    return this.adminService.getCategory(id);
  }

  @Get('categories/:id/products')
  getCategoryProducts(@Param('id') id: string, @Query() query: any) {
    return this.adminService.getCategoryProducts(id, query);
  }

  @Post('categories')
  createCategory(@Body() body: { name: string; slug?: string }) {
    return this.adminService.createCategory(body);
  }

  @Patch('categories/:id')
  updateCategory(
    @Param('id') id: string,
    @Body() body: { name?: string; slug?: string },
  ) {
    return this.adminService.updateCategory(id, body);
  }

  @Delete('categories/:id')
  deleteCategory(@Param('id') id: string) {
    return this.adminService.deleteCategory(id);
  }
}