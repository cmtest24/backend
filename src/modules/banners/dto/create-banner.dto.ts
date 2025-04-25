import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsUrl, IsOptional } from 'class-validator';

export class CreateBannerDto {
  @ApiProperty({ description: 'URL ảnh banner' })
  @IsUrl()
  imageUrl: string;

  @ApiProperty({ description: 'Tiêu đề ngắn của banner' })
  @IsString()
  shortTitle: string;

  @ApiProperty({ description: 'Tiêu đề dài của banner', required: false })
  @IsOptional()
  @IsString()
  longTitle?: string;

  @ApiProperty({ description: 'Link khi click vào banner', required: false })
  @IsOptional()
  @IsUrl()
  link?: string;

  @ApiProperty({ description: 'Số thứ tự hiển thị banner' })
  @IsNumber()
  order: number;
}