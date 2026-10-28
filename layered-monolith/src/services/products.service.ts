import { Injectable } from '@nestjs/common';
import { NotFoundError } from '../common/errors/not-found.error.js';
import { CreateProductDto } from '../dto/create-product.dto.js';
import { UpdateProductDto } from '../dto/update-product.dto.js';
import { ProductsRepository } from '../repositories/products.repository.js';

@Injectable()
export class ProductsService {
  constructor(private readonly productsRepository: ProductsRepository) {}

  create(dto: CreateProductDto) {
    return this.productsRepository.create(dto);
  }

  findAll() {
    return this.productsRepository.findMany();
  }

  async findOne(id: string) {
    const product = await this.productsRepository.findById(id);
    if (!product) throw new NotFoundError('Product', id);
    return product;
  }

  update(id: string, dto: UpdateProductDto) {
    return this.productsRepository.update(id, dto);
  }
}
