import { 
  IsNotEmpty, 
  IsString, 
  IsOptional, 
  IsEnum, 
  IsArray 
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PostStatus } from '../entities/post.entity';

export class CreatePostDto {
  @ApiProperty({ example: 'Top 10 Herbal Remedies for Common Ailments' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ example: 'This is a comprehensive guide to herbal remedies...' })
  @IsNotEmpty()
  @IsString()
  content: string;

  @ApiProperty({ example: 'A brief overview of natural remedies for everyday health issues.', required: false })
  @IsOptional()
  @IsString()
  excerpt?: string;

  @ApiProperty({ example: 'https://example.com/featured-image.jpg', required: false })
  @IsOptional()
  @IsString()
  featuredImage?: string;

  @ApiProperty({ enum: PostStatus, example: PostStatus.PUBLISHED, required: false })
  @IsOptional()
  @IsEnum(PostStatus)
  status?: PostStatus;

  @ApiProperty({ example: ['herbal', 'remedies', 'natural-health'], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
