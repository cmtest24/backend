import { 
  IsNotEmpty, 
  IsString, 
  IsOptional, 
  IsNumber, 
  Min,
  IsArray,
  ValidateNested,
  ArrayMinSize
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

class OrderItemDto {
  @ApiProperty({ description: 'Product ID' })
  @IsNotEmpty()
  @IsString()
  productId: string;

  @ApiProperty({ description: 'Quantity', minimum: 1 })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  quantity: number;
}

export class CreateOrderDto {
  @ApiPropertyOptional({ description: 'Order items (if not using cart items)' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @Type(() => OrderItemDto)
  items?: OrderItemDto[];

  @ApiProperty({ description: 'Shipping full name' })
  @IsNotEmpty()
  @IsString()
  shippingFullName: string;

  @ApiProperty({ description: 'Shipping phone number' })
  @IsNotEmpty()
  @IsString()
  shippingPhone: string;

  @ApiProperty({ description: 'Shipping address' })
  @IsNotEmpty()
  @IsString()
  shippingAddress: string;

  @ApiProperty({ description: 'Shipping ward/community' })
  @IsNotEmpty()
  @IsString()
  shippingWard: string;

  @ApiProperty({ description: 'Shipping district' })
  @IsNotEmpty()
  @IsString()
  shippingDistrict: string;

  @ApiProperty({ description: 'Shipping city/province' })
  @IsNotEmpty()
  @IsString()
  shippingCity: string;

  @ApiPropertyOptional({ description: 'Shipping postal/zip code' })
  @IsOptional()
  @IsString()
  shippingZipCode?: string;

  @ApiPropertyOptional({ description: 'Promotion code' })
  @IsOptional()
  @IsString()
  promotionCode?: string;

  @ApiPropertyOptional({ description: 'Order note' })
  @IsOptional()
  @IsString()
  note?: string;

  @ApiPropertyOptional({ description: 'Use items from cart', default: true })
  @IsOptional()
  useCartItems?: boolean = true;
}
