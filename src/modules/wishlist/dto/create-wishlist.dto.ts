import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateWishlistDto {
  @ApiProperty({ description: 'Product ID to add to wishlist' })
  @IsNotEmpty()
  @IsString()
  productId: string;
}
