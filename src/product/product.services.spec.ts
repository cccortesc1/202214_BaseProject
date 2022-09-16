import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { Repository } from 'typeorm';
import { ProductEntity } from './product.entity';
import { ProductService } from './product.service';
import { faker } from '@faker-js/faker';

describe('ProductService', () => {
  let service: ProductService;
  let repository: Repository<ProductEntity>;
  let productList: Array<ProductEntity>;

  const seedDatabase = async () => {
    repository.clear();
    productList = [];
    for (let i = 0; i < 5; i++) {
      const product: ProductEntity = await repository.save({
        name: faker.company.name(),
        price: faker.datatype.number().toString(),
        type: 'Perecedero',
      });
      productList.push(product);
    }
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig()],
      providers: [ProductService],
    }).compile();

    service = module.get<ProductService>(ProductService);
    repository = module.get<Repository<ProductEntity>>(
      getRepositoryToken(ProductEntity),
    );
    await seedDatabase();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('findAll should return all products', async () => {
    const products: ProductEntity[] = await service.findAll();
    expect(products).not.toBeNull();
    expect(products).toHaveLength(productList.length);
  });

  it('findOne should return a product by id', async () => {
    const productdProduct: ProductEntity = productList[0];
    const product: ProductEntity = await service.findOne(productdProduct.id);
    expect(product).not.toBeNull();
    expect(product.name).toEqual(productdProduct.name);
    expect(product.price).toEqual(productdProduct.price);
    expect(product.type).toEqual(productdProduct.type);
  });

  it('findOne should throw an exception for an invalid product', async () => {
    await expect(() => service.findOne('0')).rejects.toHaveProperty(
      'message',
      'the product with the given id was not found',
    );
  });

  it('create should return a new product', async () => {
    const product: ProductEntity = {
      id: '',
      name: faker.company.name(),
      price: faker.datatype.number().toString(),
      type: 'Perecedero',
      stores: [],
    };

    const newProduct: ProductEntity = await service.create(product);
    expect(newProduct).not.toBeNull();

    const storedProduct: ProductEntity = await repository.findOne({
      where: { id: `${newProduct.id}` },
    });
    expect(storedProduct).not.toBeNull();
    expect(storedProduct.name).toEqual(newProduct.name);
    expect(storedProduct.price).toEqual(newProduct.price);
    expect(storedProduct.type).toEqual(newProduct.type);
  });

  it('create should throw exception to a invalid product type', async () => {
    const product: ProductEntity = {
      id: '',
      name: faker.company.name(),
      price: faker.datatype.number().toString(),
      type: faker.animal.fish(),
      stores: [],
    };

    await expect(() => service.create(product)).rejects.toHaveProperty(
      'message',
      'the product type given was not correct',
    );
  });

  it('update should modify a product', async () => {
    const product: ProductEntity = productList[0];
    product.name = 'New name';
    product.price = faker.datatype.number().toString();
    product.type = 'Perecedero';

    const updatedproduct: ProductEntity = await service.update(
      product.id,
      product,
    );
    expect(updatedproduct).not.toBeNull();

    const storedProduct: ProductEntity = await repository.findOne({
      where: { id: `${updatedproduct.id}` },
    });
    expect(storedProduct).not.toBeNull();
    expect(storedProduct.name).toEqual(updatedproduct.name);
    expect(storedProduct.price).toEqual(updatedproduct.price);
    expect(storedProduct.type).toEqual(updatedproduct.type);
  });

  it('update should throw an exception for an invalid product', async () => {
    let product: ProductEntity = productList[0];
    product = {
      ...product,
      name: 'New name',
      price: 'New address',
      type: '',
    };
    await expect(() => service.update('0', product)).rejects.toHaveProperty(
      'message',
      'the product with the given id was not found',
    );
  });

  it('update should throw an exception for an invalid product type', async () => {
    let product: ProductEntity = productList[0];
    product = {
      ...product,
      name: 'New name',
      price: 'New address',
      type: '',
    };

    await expect(() =>
      service.update(`${product.id}`, product),
    ).rejects.toHaveProperty(
      'message',
      'the product type given was not correct',
    );
  });

  it('delete should remove a product', async () => {
    const product: ProductEntity = productList[0];
    await service.delete(product.id);
    const deletedproduct: ProductEntity = await repository.findOne({
      where: { id: `${product.id}` },
    });
    expect(deletedproduct).toBeNull();
  });

  it('delete should throw an exception for an invalid product', async () => {
    const product: ProductEntity = productList[0];
    await service.delete(product.id);
    await expect(() => service.delete('0')).rejects.toHaveProperty(
      'message',
      'the product with the given id was not found',
    );
  });
});
