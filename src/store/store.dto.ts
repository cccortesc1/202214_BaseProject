import { IsNotEmpty, IsString } from 'class-validator';
export class StoreDto {
  @IsString()
  @IsNotEmpty()
  readonly nombre: string;

  @IsString()
  @IsNotEmpty()
  readonly codigo: string;

  @IsString()
  @IsNotEmpty()
  readonly address: string;
}
