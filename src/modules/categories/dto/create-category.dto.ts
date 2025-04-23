import { IsNotEmpty, IsString, IsOptional, IsBoolean, IsNumber, IsEnum, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CategoryType } from '../enums/category-type.enum';

export class CreateCategoryDto {
  @ApiProperty({ description: 'Loại danh mục (product, service, post, video)' })
  @IsNotEmpty()
  @IsEnum(CategoryType)
  type: CategoryType;

  @ApiProperty({ description: 'Tên danh mục' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Mô tả danh mục' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'URL ảnh danh mục' })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({ description: 'Trạng thái hoạt động', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Thứ tự sắp xếp', default: 0 })
  @IsOptional()
  @IsNumber()
  sortOrder?: number;

  @ApiPropertyOptional({ description: 'ID danh mục cha (nếu có)' })
  @IsOptional()
  @IsUUID()
  parentId?: string;
}
