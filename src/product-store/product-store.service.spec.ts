import { faker } from '@faker-js/faker';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProductEntity } from '../product/product.entity';
import { StoreEntity } from '../store/store.entity';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { Repository } from 'typeorm';
import { ProductStoreService } from './product-store.service';

describe('ProductStoreService', () => {
  let service: ProductStoreService;
  let productRepository: Repository<ProductEntity>;
  let storeRepository: Repository<StoreEntity>;
  let product: ProductEntity;
  let StoresList: StoreEntity[];

  const seedDatabase = async () => {
    storeRepository.clear();
    productRepository.clear();

    StoresList = [];
    for (let i = 0; i < 5; i++) {
      const store: StoreEntity = await storeRepository.save({
        name: faker.company.name(),
        city: 'MED',
        address: faker.address.secondaryAddress(),
      });
      StoresList.push(store);
    }

    product = await productRepository.save({
      name: faker.commerce.product(),
      price: faker.commerce.price(),
      type: 'Perecedero',
      stores: StoresList,
    });
  };

  const getnewStore = () => {
    return storeRepository.save({
      name: faker.company.name(),
      address: faker.address.secondaryAddress(),
      city: 'SMR',
    });
  };

  const getNewProduct = () => {
    return productRepository.save({
      name: faker.commerce.product(),
      price: faker.commerce.price(),
      type: 'No Perecedero',
    });
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig()],
      providers: [ProductStoreService],
    }).compile();

    service = module.get<ProductStoreService>(ProductStoreService);
    storeRepository = module.get<Repository<StoreEntity>>(
      getRepositoryToken(StoreEntity),
    );
    productRepository = module.get<Repository<ProductEntity>>(
      getRepositoryToken(ProductEntity),
    );
    await seedDatabase();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('addStoreToProduct should add a store to a product', async () => {
    const newStore: StoreEntity = await getnewStore();
    const newProduct: ProductEntity = await getNewProduct();

    const result: ProductEntity = await service.addStoreToProduct(
      newProduct.id,
      newStore.id,
    );

    expect(result.stores.length).toBe(1);
    expect(result.stores[0]).not.toBeNull();
    expect(result.stores[0].name).toBe(newStore.name);
    expect(result.stores[0].address).toBe(newStore.address);
    expect(result.stores[0].city).toBe(newStore.city);
  });

  it('addStoreToProduct should thrown exception for an invalid store', async () => {
    const newProduct: ProductEntity = await getNewProduct();

    await expect(() =>
      service.addStoreToProduct(newProduct.id, '0'),
    ).rejects.toHaveProperty(
      'message',
      'the store with the given id was not found',
    );
  });

  it('addStoreToProduct should thrown exception for an invalid product', async () => {
    const newStore: StoreEntity = await getnewStore();

    await expect(() =>
      service.addStoreToProduct('0', newStore.id),
    ).rejects.toHaveProperty(
      'message',
      'the product with the given id was not found',
    );
  });

  it('findStoresFromProduct Id should return store by product', async () => {
    const storedStores: StoreEntity[] = await service.findStoresFromProduct(
      product.id,
    );
    expect(storedStores).not.toBeNull();
    expect(storedStores.length).toBeGreaterThanOrEqual(0);
  });

  it('findStoresFromProduct should throw an exception for an invalid productId', async () => {
    await expect(() =>
      service.findStoresFromProduct('0'),
    ).rejects.toHaveProperty(
      'message',
      'the product with the given id was not found',
    );
  });

  it('findStoreFromProduct should return the store from a product', async () => {
    const stores: StoreEntity[] = product.stores;
    const store: StoreEntity = stores[0];

    const storedStore: StoreEntity = await service.findStoreFromProduct(
      product.id,
      store.id,
    );

    expect(storedStore).not.toBeNull();
    expect(storedStore.name).toBe(store.name);
    expect(storedStore.address).toBe(store.address);
    expect(storedStore.city).toBe(store.city);
  });

  it('findStoreFromProduct should throw an exception for an invalid store', async () => {
    await expect(() =>
      service.findStoreFromProduct(product.id, '0'),
    ).rejects.toHaveProperty(
      'message',
      'the store with the given id was not found',
    );
  });

  it('findStoreFromProduct should throw an exception for an invalid product', async () => {
    const store: StoreEntity = StoresList[0];
    await expect(() =>
      service.findStoreFromProduct('0', store.id),
    ).rejects.toHaveProperty(
      'message',
      'the product with the given id was not found',
    );
  });

  it('findStoreFromProduct should throw an exception for a store not associated to the product', async () => {
    const newStore: StoreEntity = await getnewStore();

    await expect(() =>
      service.findStoreFromProduct(product.id, newStore.id),
    ).rejects.toHaveProperty(
      'message',
      'the store with the given id was not associate to a product',
    );
  });

  it('updateStoresFromProduct should update sores list for a product', async () => {
    const newStore: StoreEntity = await getnewStore();

    const updateProduct: ProductEntity = await service.updateStoresFromProduct(
      product.id,
      [newStore],
    );
    expect(updateProduct.stores.length).toBe(1);

    expect(updateProduct.stores[0].name).toBe(newStore.name);
    expect(updateProduct.stores[0].address).toBe(newStore.address);
    expect(updateProduct.stores[0].city).toBe(newStore.city);
  });

  it('updateStoresFromProduct should throw an exception for an invalid product', async () => {
    const newStore: StoreEntity = await getnewStore();

    await expect(() =>
      service.updateStoresFromProduct('0', [newStore]),
    ).rejects.toHaveProperty(
      'message',
      'the product with the given id was not found',
    );
  });

  it('updateStoresFromProduct should throw an exception for an invalid store', async () => {
    const newStore: StoreEntity = StoresList[0];
    newStore.id = '0';

    await expect(() =>
      service.updateStoresFromProduct(product.id, [newStore]),
    ).rejects.toHaveProperty(
      'message',
      'the store with the given id was not found',
    );
  });

  it('deleteStoreFromProduct should remove a store from a store', async () => {
    const store: StoreEntity = StoresList[0];

    await service.deleteStoreFromProduct(product.id, store.id);

    const storedProduct: ProductEntity = await productRepository.findOne({
      where: { id: `${product.id}` },
      relations: ['stores'],
    });
    const deletedStore: StoreEntity = storedProduct.stores.find(
      (a) => a.id === store.id,
    );

    expect(deletedStore).toBeUndefined();
  });

  it('deleteStoreFromProduct should thrown an exception for an invalid store', async () => {
    await expect(() =>
      service.deleteStoreFromProduct(product.id, '0'),
    ).rejects.toHaveProperty(
      'message',
      'the store with the given id was not found',
    );
  });

  it('deleteStoreFromProduct should thrown an exception for an invalid product', async () => {
    const store: StoreEntity = StoresList[0];
    await expect(() =>
      service.deleteStoreFromProduct('0', store.id),
    ).rejects.toHaveProperty(
      'message',
      'the product with the given id was not found',
    );
  });

  it('deleteStoreFromProduct should thrown an exception for an non asocciated store', async () => {
    const newStore: StoreEntity = await getnewStore();

    await expect(() =>
      service.deleteStoreFromProduct(product.id, newStore.id),
    ).rejects.toHaveProperty(
      'message',
      'the store with the given id was not associate to a product',
    );
  });
});
