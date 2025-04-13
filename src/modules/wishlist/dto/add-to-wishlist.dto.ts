import { IsNotEmpty, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddToWishlistDto {
  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsNumber()
  productId: number;
}
