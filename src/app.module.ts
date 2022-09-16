import { ProductStoreModule } from './product-store/product-store.module';
import { StoreModule } from './store/store.module';
import { ProductModule } from './product/product.module';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductEntity } from './product/product.entity';
import { StoreEntity } from './store/store.entity';

@Module({
  imports: [
    ProductStoreModule,
    StoreModule,
    ProductModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'postgres',
      database: 'stores',
      entities: [ProductEntity, StoreEntity],
      dropSchema: true,
      synchronize: true,
      keepConnectionAlive: true,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
