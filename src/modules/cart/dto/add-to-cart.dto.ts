import { IsNotEmpty, IsString, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddToCartDto {
  @ApiProperty({ description: 'Product ID to add to cart' })
  @IsNotEmpty()
  @IsString()
  productId: string;

  @ApiProperty({ description: 'Quantity of the product', minimum: 1 })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  quantity: number;
}
