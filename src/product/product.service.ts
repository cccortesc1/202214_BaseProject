import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  BusinessError,
  BusinessLogicException,
} from '../shared/errors/business-errors';
import { Repository } from 'typeorm';
import { ProductEntity } from './product.entity';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
  ) {}

  async create(product: ProductEntity): Promise<ProductEntity> {
    if (product.type === 'Perecedero' || product.type === 'No perecedero')
      return await this.productRepository.save(product);
    else
      throw new BusinessLogicException(
        'the product type given was not correct',
        BusinessError.PRECONDITION_FAILED,
      );
  }

  async findAll(): Promise<ProductEntity[]> {
    return await this.productRepository.find({
      relations: ['stores'],
    });
  }

  async findOne(id: string): Promise<ProductEntity> {
    const product: ProductEntity = await this.productRepository.findOne({
      where: { id },
      relations: ['stores'],
    });
    if (!product)
      throw new BusinessLogicException(
        'the product with the given id was not found',
        BusinessError.NOT_FOUND,
      );
    return product;
  }

  async update(id: string, product: ProductEntity): Promise<ProductEntity> {
    const persistedProduct: ProductEntity =
      await this.productRepository.findOne({
        where: { id },
        relations: ['stores'],
      });
    if (!persistedProduct)
      throw new BusinessLogicException(
        'the product with the given id was not found',
        BusinessError.NOT_FOUND,
      );
    if (product.type === 'Perecedero' || product.type === 'No perecedero')
      return await this.productRepository.save({
        ...persistedProduct,
        ...product,
      });
    else
      throw new BusinessLogicException(
        'the product type given was not correct',
        BusinessError.PRECONDITION_FAILED,
      );
  }

  async delete(id: string) {
    const product: ProductEntity = await this.productRepository.findOne({
      where: { id },
    });
    if (!product)
      throw new BusinessLogicException(
        'the product with the given id was not found',
        BusinessError.NOT_FOUND,
      );

    await this.productRepository.remove(product);
  }
}
