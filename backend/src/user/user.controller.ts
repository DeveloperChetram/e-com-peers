import { Body, Controller, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { UserService } from './user.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { RegisterProviderDto } from './dto/register-provider.dto';

@Controller('user')
export class UserController {

     constructor(private readonly userService: UserService) {}

  @Post('register')
  async register(@Body() dto: RegisterUserDto, @Res({ passthrough: true }) response: Response) {
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
  async registerProvider(@Body() dto: RegisterProviderDto, @Res({ passthrough: true }) response: Response) {
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
  async login(@Body() dto: LoginUserDto, @Res({ passthrough: true }) response: Response) {
    const result = await this.userService.login(dto);
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

}
