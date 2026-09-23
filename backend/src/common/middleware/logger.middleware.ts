import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction): void {
    const { method, originalUrl, ip } = req;
    const userAgent = req.get('user-agent') || '';
    const startTime = Date.now();

    this.logger.log(`--> ${method} ${originalUrl} [IP: ${ip || 'unknown'}]`);

    res.on('finish', () => {
      const { statusCode } = res;
      const duration = Date.now() - startTime;
      this.logger.log(
        `<-- ${method} ${originalUrl} ${statusCode} - ${duration}ms${userAgent ? ` [${userAgent}]` : ''}`,
      );
    });

    next();
  }
}
