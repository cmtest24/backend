import { 
  IsNotEmpty, 
  IsString, 
  IsNumber, 
  IsOptional, 
  IsArray, 
  IsEnum, 
  IsBoolean, 
  IsObject,
  Min,
  ValidateNested,
  ArrayMinSize
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { ProductStatus } from '../entities/product.entity';

export class AttributeDto {
  @ApiProperty({ example: 'Color' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 'Red' })
  @IsNotEmpty()
  @IsString()
  value: string;
}

export class CreateProductDto {
  @ApiProperty({ example: 'Đông Trùng Hạ Thảo Organic' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 'Đông Trùng Hạ Thảo tự nhiên được thu hái tại vùng núi cao' })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({ example: 'Sản phẩm thảo dược 100% tự nhiên', required: false })
  @IsOptional()
  @IsString()
  shortDescription?: string;

  @ApiProperty({ example: 250000 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ example: 300000, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  originalPrice?: number;

  @ApiProperty({ example: 100 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  quantity: number;

  @ApiProperty({ example: ['https://example.com/image1.jpg'], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ApiProperty({ example: 'https://example.com/thumbnail.jpg', required: false })
  @IsOptional()
  @IsString()
  thumbnail?: string;

  @ApiProperty({ enum: ProductStatus, default: ProductStatus.ACTIVE, required: false })
  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @ApiProperty({ example: { weightInGrams: 50, origin: 'Vietnam' }, required: false })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @ApiProperty({ type: [AttributeDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AttributeDto)
  attributes?: AttributeDto[];

  @ApiProperty({ example: ['organic', 'herbal'], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiProperty({ example: 'DTHY-001', required: false })
  @IsOptional()
  @IsString()
  sku?: string;

  @ApiProperty({ example: '8938500886039', required: false })
  @IsOptional()
  @IsString()
  barcode?: string;

  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsNumber()
  categoryId: number;
}
