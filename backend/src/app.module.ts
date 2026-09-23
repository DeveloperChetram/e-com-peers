import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // 1. Logger - applied globally
    consumer.apply(LoggerMiddleware).forRoutes('*');

    // 2. UserMiddleware - any logged-in user (USER, ADMIN, PROVIDER, PROVIDER_STAFF)
    //    Apply to routes accessible by everyone who is logged in
    
    consumer
      .apply(UserMiddleware)
      .exclude('user/register', 'user/login')
      .forRoutes('products', 'categories');

    // 3. AdminMiddleware - only ADMIN role
    //    Apply to admin-only routes
    // consumer
    //   .apply(AdminMiddleware)
    //   .forRoutes('admin');

    // 4. ProviderMiddleware - only PROVIDER or PROVIDER_STAFF role
    //    Apply to provider-only routes
    // consumer
    //   .apply(ProviderMiddleware)
    //   .forRoutes('providers');
  }
}
