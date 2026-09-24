import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request, Response, NextFunction } from 'express';
import { PrismaService } from '../../prisma/prisma.service';
const PROVIDER_ROLES = ['PROVIDER', 'PROVIDER_STAFF', 'ADMIN'];

@Injectable()
export class ProviderMiddleware implements NestMiddleware {
  constructor(private readonly jwtService: JwtService, private readonly prisma: PrismaService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    let token = req.cookies?.['accessToken'];

    if (!token) {
      const authHeader = req.headers['authorization'];
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
      }
    }

    if (!token) {
      throw new UnauthorizedException('Missing or invalid Authorization token');
    }

    try {
      const payload = this.jwtService.verify(token);

      if (!PROVIDER_ROLES.includes(payload.role)) {
        throw new ForbiddenException('Access denied: Providers only');
      }

      const user = await this.prisma.user.findUnique({
        where: { id: payload.id },
      });

      if (!user) {
        throw new UnauthorizedException('Invalid or expired token user not found');
      }

      const provider = await this.prisma.provider.findUnique({
        where: { userId: payload.id },
      });

      if (!provider) {
        throw new ForbiddenException('Access denied: Provider not found');
      }
      
      (req as any).user = {...user,provider: { ...provider}};
      next();
    } catch (err) {
      if (err instanceof ForbiddenException) throw err;
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
