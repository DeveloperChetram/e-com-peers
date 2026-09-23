import { Body, Controller, Get, Post } from '@nestjs/common';
import { createCategoryDto } from './dto/create-category.dto';
import { CategoriesService } from './categories.service';

@Controller('categories')
export class CategoriesController {

    constructor(private readonly  categoriesService: CategoriesService){}

    @Post()
    createCategory(@Body() dto:createCategoryDto){
        return this.categoriesService.createCategory(dto)
    }

    @Get()
    getCategories(){
        return this.categoriesService.getCatrgories()
    }

}
