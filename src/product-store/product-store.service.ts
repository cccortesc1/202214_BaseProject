import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductEntity } from '../product/product.entity';
import { Repository } from 'typeorm';
import { StoreEntity } from '../store/store.entity';
import {
  BusinessError,
  BusinessLogicException,
} from '../shared/errors/business-errors';

@Injectable()
export class ProductStoreService {
  constructor(
    @InjectRepository(StoreEntity)
    private readonly storeRepository: Repository<StoreEntity>,

    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
  ) {}

  async getStoreByStoreId(storeId: string) {
    const store: StoreEntity = await this.storeRepository.findOne({
      where: { id: storeId },
    });
    if (!store)
      throw new BusinessLogicException(
        'the store with the given id was not found',
        BusinessError.NOT_FOUND,
      );
    return store;
  }

  async getProductByProductId(productId: string) {
    const product: ProductEntity = await this.productRepository.findOne({
      where: { id: productId },
      relations: ['stores'],
    });
    if (!product)
      throw new BusinessLogicException(
        'the product with the given id was not found',
        BusinessError.NOT_FOUND,
      );
    return product;
  }

  async addStoreToProduct(
    productId: string,
    storeId: string,
  ): Promise<ProductEntity> {
    const store: StoreEntity = await this.getStoreByStoreId(storeId);
    const product: ProductEntity = await this.getProductByProductId(productId);

    product.stores = [...product.stores, store];
    return await this.productRepository.save(product);
  }

  async findStoresFromProduct(productId: string): Promise<StoreEntity[]> {
    const product: ProductEntity = await this.getProductByProductId(productId);

    return product.stores;
  }

  async findStoreFromProduct(
    productId: string,
    storeId: string,
  ): Promise<StoreEntity> {
    const store: StoreEntity = await this.getStoreByStoreId(storeId);
    const product: ProductEntity = await this.getProductByProductId(productId);

    const productStore: StoreEntity = product.stores.find(
      (e) => e.id === store.id,
    );

    if (!productStore)
      throw new BusinessLogicException(
        'the store with the given id was not associate to a product',
        BusinessError.PRECONDITION_FAILED,
      );

    return productStore;
  }

  async updateStoresFromProduct(
    productId: string,
    stores: StoreEntity[],
  ): Promise<ProductEntity> {
    const product: ProductEntity = await this.getProductByProductId(productId);
    let storeId: string;

    for (let i = 0; i < stores.length; i++) {
      storeId = `${stores[i].id}`;
      const store: StoreEntity = await this.getStoreByStoreId(storeId);

      if (!store)
        throw new BusinessLogicException(
          'the store with the given id was not found',
          BusinessError.NOT_FOUND,
        );
    }
    product.stores = stores;
    return await this.productRepository.save(product);
  }

  async deleteStoreFromProduct(productId: string, storeId: string) {
    const storeToDelete: StoreEntity = await this.getStoreByStoreId(storeId);

    const product: ProductEntity = await this.getProductByProductId(productId);

    const productStore: StoreEntity = product.stores.find(
      (e) => e.id === storeToDelete.id,
    );

    if (!productStore)
      throw new BusinessLogicException(
        'the store with the given id was not associate to a product',
        BusinessError.PRECONDITION_FAILED,
      );

    product.stores = product.stores.filter((e) => e.id !== storeId);

    await this.productRepository.save(product);
  }
}
