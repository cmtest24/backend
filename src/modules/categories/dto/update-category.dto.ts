import { IsString, IsOptional, IsBoolean, IsNumber, IsEnum, IsUUID, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CategoryType } from '../enums/category-type.enum';

export class UpdateCategoryDto {
  @ApiPropertyOptional({ description: 'Loại danh mục (product, service, post, video)' })
  @IsOptional()
  @IsEnum(CategoryType)
  type?: CategoryType;

  @ApiPropertyOptional({ description: 'Tên danh mục' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Slug (url friendly)' })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiPropertyOptional({ description: 'Description of the category' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Whether the category is active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Order for sorting categories' })
  @IsOptional()
  @IsNumber()
  sortOrder?: number;

  @ApiPropertyOptional({ description: 'Cấp độ danh mục' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  level?: number;
}
