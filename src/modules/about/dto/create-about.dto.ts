import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAboutDto {
  @ApiProperty({ description: 'Tiêu đề của About', required: false })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({ description: 'Nội dung của About', required: false })
  @IsString()
  @IsOptional()
  content?: string;

  @ApiProperty({ description: 'Sứ mệnh của công ty', required: false })
  @IsString()
  @IsOptional()
  mission?: string;

  @ApiProperty({ description: 'Tầm nhìn của công ty', required: false })
  @IsString()
  @IsOptional()
  vision?: string;

  @ApiProperty({ description: 'Lịch sử của công ty', required: false })
  @IsString()
  @IsOptional()
  history?: string;
}