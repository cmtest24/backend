import { 
  IsOptional, 
  IsString, 
  IsNumber, 
  IsArray, 
  IsEnum, 
  IsBoolean, 
  IsObject,
  Min,
  ValidateNested
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { ProductStatus } from '../entities/product.entity';
import { AttributeDto } from './create-product.dto';

export class UpdateProductDto {
  @ApiProperty({ example: 'Đông Trùng Hạ Thảo Organic Premium', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: 'Đông Trùng Hạ Thảo tự nhiên được thu hái tại vùng núi cao', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'Sản phẩm thảo dược 100% tự nhiên', required: false })
  @IsOptional()
  @IsString()
  shortDescription?: string;

  @ApiProperty({ example: 280000, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiProperty({ example: 320000, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  originalPrice?: number;

  @ApiProperty({ example: 150, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  quantity?: number;

  @ApiProperty({ example: ['https://example.com/image1.jpg'], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ApiProperty({ example: 'https://example.com/new-thumbnail.jpg', required: false })
  @IsOptional()
  @IsString()
  thumbnail?: string;

  @ApiProperty({ enum: ProductStatus, required: false })
  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;

  @ApiProperty({ example: false, required: false })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @ApiProperty({ example: { weightInGrams: 75, origin: 'Vietnam' }, required: false })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @ApiProperty({ type: [AttributeDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AttributeDto)
  attributes?: AttributeDto[];

  @ApiProperty({ example: ['premium', 'organic', 'herbal'], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiProperty({ example: 'DTHY-002', required: false })
  @IsOptional()
  @IsString()
  sku?: string;

  @ApiProperty({ example: '8938500886046', required: false })
  @IsOptional()
  @IsString()
  barcode?: string;

  @ApiProperty({ example: 2, required: false })
  @IsOptional()
  @IsNumber()
  categoryId?: number;
}
