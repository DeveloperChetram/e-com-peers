import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { createObserveModule } from '@nestjs/observe';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { ProductsModule } from './products/products.module';
import { PrismaModule } from './prisma/prisma.module';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { UserMiddleware } from './common/middleware/user.middleware';
import { AdminMiddleware } from './common/middleware/admin.middleware';
import { ProviderMiddleware } from './common/middleware/provider.middleware';
import { CategoriesModule } from './categories/categories.module';
import { AdminController } from './admin/admin.controller';
import { AdminService } from './admin/admin.service';
import { AdminModule } from './admin/admin.module';

export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [
    // Distributed tracing, auto-correlated logs, request/job metrics, error
    // telemetry, alarms, and more — out of the box. Sign up at https://observe.nestjs.com
    ObserveModule.forRoot({
      appKey: 'YOUR_APP_KEY',
      appSecret: 'YOUR_APP_SECRET',
      serviceId: 'backend',
    }),
    UserModule,
    ProductsModule,
    PrismaModule,
    CategoriesModule,
    AdminModule,
  ],
  controllers: [AppController, AdminController],
  providers: [AppService, AdminService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // 1. Logger - applied globally
    consumer.apply(LoggerMiddleware).forRoutes('*');

    // 2. ProviderMiddleware - only PROVIDER, PROVIDER_STAFF or ADMIN role
    //    Protects provider inventory management (create, read own, update, publish, delete)
    consumer
      .apply(ProviderMiddleware)
      .forRoutes(
        { path: 'products', method: RequestMethod.POST },
        { path: 'products/my', method: RequestMethod.GET },
        { path: 'products/my/:id', method: RequestMethod.GET },
        { path: 'products/:id/publish', method: RequestMethod.PATCH },
        { path: 'products/:id', method: RequestMethod.PATCH },
        { path: 'products/:id', method: RequestMethod.PUT },
        { path: 'products/:id', method: RequestMethod.DELETE },
      );
  }
}
