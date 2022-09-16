import { IsNotEmpty, IsString } from 'class-validator';
export class ProductDto {
  @IsString()
  @IsNotEmpty()
  readonly name: string;

  @IsString()
  @IsNotEmpty()
  readonly preice: string;

  @IsString()
  @IsNotEmpty()
  readonly type: string;
}
