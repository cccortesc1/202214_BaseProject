import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { Repository } from 'typeorm';
import { StoreEntity } from './store.entity';
import { StoreService } from './store.service';
import { faker } from '@faker-js/faker';

describe('StoreService', () => {
  let service: StoreService;
  let repository: Repository<StoreEntity>;
  let storeList: Array<StoreEntity>;

  const seedDatabase = async () => {
    repository.clear();
    storeList = [];
    for (let i = 0; i < 5; i++) {
      const store: StoreEntity = await repository.save({
        name: faker.company.name(),
        address: faker.address.streetAddress(),
        city: faker.address.city().substring(1, 3),
      });
      storeList.push(store);
    }
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig()],
      providers: [StoreService],
    }).compile();

    service = module.get<StoreService>(StoreService);
    repository = module.get<Repository<StoreEntity>>(
      getRepositoryToken(StoreEntity),
    );
    await seedDatabase();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('findAll should return all stores', async () => {
    const stores: StoreEntity[] = await service.findAll();
    expect(stores).not.toBeNull();
    expect(stores).toHaveLength(storeList.length);
  });

  it('findOne should return a store by id', async () => {
    const storedStore: StoreEntity = storeList[0];
    const store: StoreEntity = await service.findOne(storedStore.id);
    expect(store).not.toBeNull();
    expect(store.name).toEqual(storedStore.name);
    expect(store.address).toEqual(storedStore.address);
    expect(store.city).toEqual(storedStore.city);
  });

  it('findOne should throw an exception for an invalid store', async () => {
    await expect(() => service.findOne('0')).rejects.toHaveProperty(
      'message',
      'the store with the given id was not found',
    );
  });

  it('create should return a new store', async () => {
    const store: StoreEntity = {
      id: '',
      name: faker.company.name(),
      address: faker.address.secondaryAddress(),
      city: faker.address.city(),
      products: [],
    };

    const newStore: StoreEntity = await service.create(store);
    expect(newStore).not.toBeNull();

    const storedMuseum: StoreEntity = await repository.findOne({
      where: { id: `${newStore.id}` },
    });
    expect(storedMuseum).not.toBeNull();
    expect(storedMuseum.name).toEqual(newStore.name);
    expect(storedMuseum.address).toEqual(newStore.address);
    expect(storedMuseum.city).toEqual(newStore.city);
  });

  it('update should modify a store', async () => {
    const store: StoreEntity = storeList[0];
    store.name = 'New name';
    store.address = 'New address';
    store.city = 'BOG';
    store.products = [];

    const updatedstore: StoreEntity = await service.update(store.id, store);
    expect(updatedstore).not.toBeNull();

    const storedstore: StoreEntity = await repository.findOne({
      where: { id: `${store.id}` },
    });
    expect(storedstore).not.toBeNull();
    expect(storedstore.name).toEqual(store.name);
    expect(storedstore.address).toEqual(store.address);
    expect(storedstore.city).toEqual(store.city);
  });

  it('update should throw an exception for an invalid store', async () => {
    let store: StoreEntity = storeList[0];
    store = {
      ...store,
      name: 'New name',
      address: 'New address',
      city: '',
    };
    await expect(() => service.update('0', store)).rejects.toHaveProperty(
      'message',
      'the store with the given id was not found',
    );
  });

  it('delete should remove a store', async () => {
    const store: StoreEntity = storeList[0];
    await service.delete(store.id);
    const deletedstore: StoreEntity = await repository.findOne({
      where: { id: `${store.id}` },
    });
    expect(deletedstore).toBeNull();
  });

  it('delete should throw an exception for an invalid store', async () => {
    const store: StoreEntity = storeList[0];
    await service.delete(store.id);
    await expect(() => service.delete('0')).rejects.toHaveProperty(
      'message',
      'the store with the given id was not found',
    );
  });
});
