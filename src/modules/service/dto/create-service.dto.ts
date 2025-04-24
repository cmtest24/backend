import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateServiceDto {
  @ApiProperty({ description: 'Tên dịch vụ' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Slug duy nhất của dịch vụ' })
  @IsString()
  @IsNotEmpty()
  slug: string;

  @ApiProperty({ description: 'ID danh mục dịch vụ' })
  @IsString()
  @IsNotEmpty()
  categoryId: string;

  @ApiProperty({ description: 'Mô tả ngắn về dịch vụ' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ description: 'Mô tả chi tiết về dịch vụ' })
  @IsString()
  @IsNotEmpty()
  longdescription: string;

  @ApiProperty({ description: 'URL hình ảnh dịch vụ' })
  @IsString()
  @IsNotEmpty()
  image: string;

  @ApiProperty({ description: 'Giá dịch vụ' })
  @IsNumber()
  @IsNotEmpty()
  price: number;

  @ApiProperty({ description: 'Giá khuyến mãi dịch vụ', required: false })
  @IsNumber()
  @IsOptional()
  salePrice?: number;
}