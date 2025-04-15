import { 
  IsNotEmpty, 
  IsString, 
  IsNumber, 
  IsOptional, 
  IsBoolean, 
  IsArray, 
  Min, 
  Max,
  IsPositive
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CreateProductDto {
  @ApiProperty({ description: 'Name of the product' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'Detailed description of the product' })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({ description: 'Regular price of the product' })
  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  price: number;

  @ApiPropertyOptional({ description: 'Sale price of the product' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  salePrice?: number;

  @ApiProperty({ description: 'Stock quantity of the product' })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  stockQuantity: number;

  @ApiPropertyOptional({ description: 'URL to the main product image' })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => {
    if (!value) return value;
    if (value.startsWith('http')) return value;
    return `${process.env.DOMAIN}${value}`;
  })
  imageUrl?: string;

  @ApiPropertyOptional({ description: 'Additional product images' })
  @IsOptional()
  @IsArray()
  @Transform(({ value }) => {
    if (!value) return value;
    return value.map(url => {
      if (url.startsWith('http')) return url;
      return `${process.env.DOMAIN}${url}`;
    });
  })
  additionalImages?: string[];

  @ApiPropertyOptional({ description: 'Tags associated with the product' })
  @IsOptional()
  @IsArray()
  tags?: string[];

  @ApiPropertyOptional({ description: 'Whether the product is active', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Whether the product is featured', default: false })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @ApiPropertyOptional({ description: 'Product specifications in detail' })
  @IsOptional()
  @IsString()
  specifications?: string;

  @ApiPropertyOptional({ description: 'Usage instructions for the product' })
  @IsOptional()
  @IsString()
  usageInstructions?: string;

  @ApiPropertyOptional({ description: 'Stock keeping unit (SKU)' })
  @IsOptional()
  @IsString()
  sku?: string;

  @ApiPropertyOptional({ description: 'Category ID the product belongs to' })
  @IsOptional()
  @IsString()
  categoryId?: string;
}
