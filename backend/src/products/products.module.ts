import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller.js';
import { ProductsService } from './products.service.js';
import { CloudinaryModule } from '../cloudinary/cloudinary.module.js';

@Module({
  controllers: [ProductsController],
  providers: [ProductsService],
  imports: [CloudinaryModule]
})
export class ProductsModule {}
