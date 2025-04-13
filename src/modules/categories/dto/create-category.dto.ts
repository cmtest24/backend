import { IsNotEmpty, IsString, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Thảo dược' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 'Các sản phẩm thảo dược tự nhiên', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'https://example.com/category-image.jpg', required: false })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsNumber()
  parentId?: number;
}
