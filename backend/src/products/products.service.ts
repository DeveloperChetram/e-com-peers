import { Injectable } from '@nestjs/common';

@Injectable()
export class ProductsService {
  getProducts() {
    return [
      { id: 1, name: 'iPhone 15', price: 69999 },
      { id: 2, name: 'MacBook Air M3', price: 99999 },
    ];
  }
}