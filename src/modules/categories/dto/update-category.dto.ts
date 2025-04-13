import { IsOptional, IsString, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCategoryDto {
  @ApiProperty({ example: 'Thảo dược cao cấp', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: 'Các sản phẩm thảo dược tự nhiên cao cấp', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'https://example.com/new-category-image.jpg', required: false })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiProperty({ example: 2, required: false })
  @IsOptional()
  @IsNumber()
  parentId?: number;
  
  // This will be set automatically if name is changed
  slug?: string;
}
