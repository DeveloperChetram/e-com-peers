import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';

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

  async login (dto: LoginUserDto){
    const email = dto.email.toLowerCase().trim();

    const user = await this.prisma.user.findUnique({
    where: { email },  });

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
    user: userWithoutPassword,
  };



  }
}