import { IsOptional, IsNumber, IsString, IsArray, IsBoolean, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateReviewDto {
  @ApiProperty({ example: 4, minimum: 1, maximum: 5, required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  rating?: number;

  @ApiProperty({ example: 'Updated review after using for a month.', required: false })
  @IsOptional()
  @IsString()
  comment?: string;

  @ApiProperty({ example: ['https://example.com/new-image.jpg'], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ApiProperty({ example: false, required: false })
  @IsOptional()
  @IsBoolean()
  isVisible?: boolean;
}
