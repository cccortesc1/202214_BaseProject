import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  UseInterceptors,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { StoreDto } from '../store/store.dto';
import { StoreEntity } from '../store/store.entity';
import { BusinessErrorsInterceptor } from '../shared/interceptors/business-errors.interceptor';
import { ProductStoreService } from './product-store.service';

@Controller('product-store')
@UseInterceptors(BusinessErrorsInterceptor)
export class ProductStoreController {
  constructor(private readonly productStoreService: ProductStoreService) {}
  @Post(':productId/stores/:storesId')
  async addStoreToProduct(
    @Param('productId') productId: string,
    @Param('storesId') storesId: string,
  ) {
    return await this.productStoreService.addStoreToProduct(
      productId,
      storesId,
    );
  }

  @Get(':productId/stores')
  async findStoresFromProduct(@Param('productId') productId: string) {
    return await this.productStoreService.findStoresFromProduct(productId);
  }

  @Get(':productId/stores/:storeId')
  async findStoreFromProduct(
    @Param('productId') productId: string,
    @Param('storeId') storeId: string,
  ) {
    return await this.productStoreService.findStoreFromProduct(
      productId,
      storeId,
    );
  }

  @Put(':productId/stores')
  async updateStoresFromProduct(
    @Body() storeDto: StoreDto[],
    @Param('productId') productId: string,
  ) {
    const stores = plainToInstance(StoreEntity, storeDto);
    return await this.productStoreService.updateStoresFromProduct(
      productId,
      stores,
    );
  }

  @Delete(':productId/stores/:storeId')
  @HttpCode(204)
  async deleteStoresFromProduct(
    @Param('productId') productId: string,
    @Param('storeId') storeId: string,
  ) {
    return await this.productStoreService.deleteStoresFromProduct(
      productId,
      storeId,
    );
  }
}
