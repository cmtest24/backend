import { 
  IsOptional, 
  IsString, 
  IsEnum, 
  IsArray 
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PostStatus } from '../entities/post.entity';

export class UpdatePostDto {
  @ApiProperty({ example: 'Updated: Top 10 Herbal Remedies for Common Ailments', required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ example: 'Updated content with more information...', required: false })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiProperty({ example: 'Updated excerpt with new information.', required: false })
  @IsOptional()
  @IsString()
  excerpt?: string;

  @ApiProperty({ example: 'https://example.com/new-featured-image.jpg', required: false })
  @IsOptional()
  @IsString()
  featuredImage?: string;

  @ApiProperty({ enum: PostStatus, example: PostStatus.PUBLISHED, required: false })
  @IsOptional()
  @IsEnum(PostStatus)
  status?: PostStatus;

  @ApiProperty({ example: ['herbal', 'remedies', 'natural-health', 'new-tag'], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
