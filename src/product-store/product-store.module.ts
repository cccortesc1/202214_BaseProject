import { ProductStoreService } from './product-store.service';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StoreEntity } from '../store/store.entity';
import { ProductEntity } from '../product/product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProductEntity, StoreEntity])],
  controllers: [],
  providers: [ProductStoreService],
})
export class ProductStoreModule {}
