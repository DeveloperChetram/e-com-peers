import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { Request } from 'express';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FilterProductDto } from './dto/filter-product.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

const productMulterOptions = {
  storage: diskStorage({
    destination: './uploads/products',
    filename: (req, file, callback) => {
      const uniqueName =
        `${Date.now()}-${Math.round(Math.random() * 1e9)}` +
        extname(file.originalname);
      callback(null, uniqueName);
    },
  }),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
  },
  fileFilter: (req: any, file: any, callback: any) => {
    if (!file.mimetype.startsWith('image/')) {
      return callback(new Error('Only image files are allowed'), false);
    }
    callback(null, true);
  },
};

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @UseInterceptors(FileInterceptor('image', productMulterOptions))
  createProduct(
    @Body() dto: CreateProductDto,
    @Req() req: Request,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const user = (req as any).user;
    return this.productsService.createProduct(dto, user, file);
  }

  @Get()
  getProducts() {
    return this.productsService.getProducts();
  }

  @Get('filter')
  filterProducts(@Query() query: FilterProductDto) {
    return this.productsService.filterProducts(query);
  }

  @Get('my')
  getMyProducts(
    @Req() req: Request,
    @Query('search') search?: string,
    @Query('categoryId') categoryId?: string,
    @Query('status') status?: string,
  ) {
    const user = (req as any).user;
    return this.productsService.getMyProducts(user?.id, {
      search,
      categoryId,
      status,
    });
  }

  @Get('my/:id')
  getMyProductById(@Param('id') id: string, @Req() req: Request) {
    const user = (req as any).user;
    return this.productsService.getMyProductById(id, user);
  }

  @Get(':id')
  getProductById(@Param('id') id: string) {
    return this.productsService.getProductById(id);
  }

  @Patch(':id/publish')
  togglePublish(
    @Param('id') id: string,
    @Req() req: Request,
    @Body('isPublished') isPublished?: boolean,
  ) {
    const user = (req as any).user;
    return this.productsService.togglePublish(id, user, isPublished);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('image', productMulterOptions))
  updateProduct(
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
    @Req() req: Request,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const user = (req as any).user;
    return this.productsService.updateProduct(id, dto, user, file);
  }

  @Delete(':id')
  deleteProduct(@Param('id') id: string, @Req() req: Request) {
    const user = (req as any).user;
    return this.productsService.deleteProduct(id, user);
  }
}