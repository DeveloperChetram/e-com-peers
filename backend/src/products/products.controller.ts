import { Body, Controller, Get, Post } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';


@Controller('products')
export class ProductsController {
  constructor(private productsService: ProductsService) {}


  @Post()
  createProduct(@Body() dto:CreateProductDto) {
    return this.productsService.createProduct(dto);
  }

  @Get()
  getProducts(){
    return this.productsService.getProducts()
  }

}