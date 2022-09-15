import { StoreEntity } from '../store/store.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class ProductEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  price: string;

  @Column()
  type: string;

  @ManyToOne(() => StoreEntity, (store) => store.products)
  stores: StoreEntity[];
}
