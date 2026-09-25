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
import { AdminModule } from './admin/admin.module';
import { AdminController } from './admin/admin.controller';
import { OrderModule } from './order/order.module';

export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [
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
    OrderModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // 1. Logger - applied globally
    consumer.apply(LoggerMiddleware).forRoutes('*');

    // 2. ProviderMiddleware - only PROVIDER, PROVIDER_STAFF or ADMIN role
    //    Protects provider inventory management (create, read own, update, publish, delete) and provider orders
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
        { path: 'orders/provider', method: RequestMethod.ALL },
        { path: 'orders/provider/*', method: RequestMethod.ALL },
      );

    // 3. AdminMiddleware - only ADMIN role
    //    Protects all admin governance endpoints (stats, users, providers, product approvals, admin orders)
    consumer
      .apply(AdminMiddleware)
      .exclude({ path: 'admin/login', method: RequestMethod.POST })
      .forRoutes(
        AdminController,
        { path: 'orders/admin', method: RequestMethod.ALL },
        { path: 'orders/admin/*', method: RequestMethod.ALL },
      );

    // 4. UserMiddleware - authenticated users
    consumer
      .apply(UserMiddleware)
      .exclude(
        { path: 'orders/provider', method: RequestMethod.ALL },
        { path: 'orders/provider/*', method: RequestMethod.ALL },
        { path: 'orders/admin', method: RequestMethod.ALL },
        { path: 'orders/admin/*', method: RequestMethod.ALL },
      )
      .forRoutes(
        { path: 'user/profile', method: RequestMethod.GET },
        { path: 'user/profile', method: RequestMethod.PATCH },
        { path: 'user/cart', method: RequestMethod.ALL },
        { path: 'user/cart/*', method: RequestMethod.ALL },
        { path: 'user/favorites', method: RequestMethod.ALL },
        { path: 'user/favorites/*', method: RequestMethod.ALL },
        { path: 'user/addresses', method: RequestMethod.ALL },
        { path: 'user/addresses/*', method: RequestMethod.ALL },
        { path: 'orders', method: RequestMethod.ALL },
        { path: 'orders/*', method: RequestMethod.ALL },
      );
  }
}
