import { IsNotEmpty, IsString, IsInt, IsOptional, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateReviewDto {
  @ApiProperty({ description: 'Product ID to review' })
  @IsNotEmpty()
  @IsString()
  productId: string;

  @ApiProperty({ description: 'Rating from 1 to 5', minimum: 1, maximum: 5 })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiProperty({ description: 'Review comment/feedback' })
  @IsNotEmpty()
  @IsString()
  comment: string;

  @ApiPropertyOptional({ description: 'URL to review image' })
  @IsOptional()
  @IsString()
  imageUrl?: string;
}
