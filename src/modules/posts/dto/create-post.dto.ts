import { IsNotEmpty, IsString, IsOptional, IsBoolean, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePostDto {
  @ApiProperty({ description: 'Title of the blog post' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ description: 'URL-friendly slug for the post' })
  @IsNotEmpty()
  @IsString()
  slug: string;

  @ApiProperty({ description: 'Full content of the post in HTML/Markdown' })
  @IsNotEmpty()
  @IsString()
  content: string;

  @ApiPropertyOptional({ description: 'Short summary of the post' })
  @IsOptional()
  @IsString()
  summary?: string;

  @ApiPropertyOptional({ description: 'URL to the featured image' })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({ description: 'Whether the post is published', default: true })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @ApiPropertyOptional({ description: 'Tags associated with the post' })
  @IsOptional()
  @IsArray()
  tags?: string[];

  @ApiPropertyOptional({ description: 'Name of the post author' })
  @IsOptional()
  @IsString()
  authorName?: string;
}
