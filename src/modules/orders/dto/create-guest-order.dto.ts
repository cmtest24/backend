import { 
  IsNotEmpty, 
  IsString, 
  IsOptional, 
  IsNumber, 
  Min,
  IsArray,
  ValidateNested,
  ArrayMinSize,
  IsEmail,
  IsPhoneNumber
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

class GuestOrderItemDto {
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

export class CreateGuestOrderDto {
  @ApiProperty({ description: 'Order items' })
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @Type(() => GuestOrderItemDto)
  items: GuestOrderItemDto[];

  @ApiProperty({ description: 'Customer full name' })
  @IsNotEmpty()
  @IsString()
  fullName: string;

  @ApiProperty({ description: 'Customer phone number' })
  @IsNotEmpty()
  @IsString()
  @IsPhoneNumber(null, { message: 'Invalid phone number format' })
  phoneNumber: string;

  @ApiProperty({ description: 'Order note' })
  @IsOptional()
  @IsString()
  note?: string;

  @ApiProperty({ description: 'Shipping address' })
  @IsNotEmpty()
  @IsString()
  address: string;
}
