import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';

@Injectable()
export class ProductsService {
 constructor(private readonly prisma: PrismaService){}

 async createProduct(dto:CreateProductDto){
  const category = await this.prisma.category.findUnique({where:{id:dto.categoryId}})
  if(!category)  throw new NotFoundException('Category not found');

  return this.prisma.product.create({
    data:{
      name:dto.name,
      description:dto.description,
      price:dto.price,
      imageUrl:dto.imageUrl,
      category:{
        connect:{id:dto.categoryId}
      },
      provider: dto.providerId ? {
        connect:{id:dto.providerId}
      } : undefined
    }
  })

 }

 async getProducts(){
  return this.prisma.product.findMany({
    include:{
      category:true,
      }
  })
 }
}