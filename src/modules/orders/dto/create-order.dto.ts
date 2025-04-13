import { 
  IsNotEmpty, 
  IsString, 
  IsEmail, 
  IsEnum,
  IsOptional, 
  IsArray,
  ValidateNested,
  IsNumber,
  Min
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { PaymentMethod } from '../entities/order.entity';

class OrderItemDto {
  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsNumber()
  productId: number;

  @ApiProperty({ example: 2 })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  quantity: number;
}

export class CreateOrderDto {
  @ApiProperty({ example: 'Nguyen Van A' })
  @IsNotEmpty()
  @IsString()
  customerName: string;

  @ApiProperty({ example: 'user@example.com' })
  @IsNotEmpty()
  @IsEmail()
  customerEmail: string;

  @ApiProperty({ example: '+84123456789' })
  @IsNotEmpty()
  @IsString()
  customerPhone: string;

  @ApiProperty({ example: '123 Main Street, Apartment 4B' })
  @IsNotEmpty()
  @IsString()
  shippingAddress: string;

  @ApiProperty({ example: 'Ho Chi Minh City' })
  @IsOptional()
  @IsString()
  shippingCity?: string;

  @ApiProperty({ example: 'District 1' })
  @IsOptional()
  @IsString()
  shippingDistrict?: string;

  @ApiProperty({ example: 'Ben Nghe Ward' })
  @IsOptional()
  @IsString()
  shippingWard?: string;

  @ApiProperty({ example: 'Please call before delivery', required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ enum: PaymentMethod, example: PaymentMethod.COD })
  @IsNotEmpty()
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ApiProperty({ example: 'SUMMER10', required: false })
  @IsOptional()
  @IsString()
  promotionCode?: string;

  @ApiProperty({ example: [{productId: 1, quantity: 2}], type: [OrderItemDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items?: OrderItemDto[];

  // If creating from cart, no need to specify items
  @ApiProperty({ example: true, required: false })
  @IsOptional()
  useCart?: boolean;

  // Optional shipping address ID to use from user's saved addresses
  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsNumber()
  addressId?: number;
}
