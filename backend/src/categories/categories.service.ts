import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { createCategoryDto } from './dto/create-category.dto';

@Injectable()
export class CategoriesService {
    constructor(private readonly prisma:PrismaService){}

    async createCategory(dto:createCategoryDto){
        return this.prisma.category.create({
            data:{
                name:dto.name,
                slug:dto.slug
            }
        })
    }


    async getCatrgories(){
        return await this.prisma.category.findMany()
    }

}
