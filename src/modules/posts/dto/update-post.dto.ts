import { IsString, IsOptional, IsBoolean, IsArray } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdatePostDto {
  @ApiPropertyOptional({ description: 'Title of the blog post' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ description: 'URL-friendly slug for the post' })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiPropertyOptional({ description: 'Full content of the post in HTML/Markdown' })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional({ description: 'Short summary of the post' })
  @IsOptional()
  @IsString()
  summary?: string;

  @ApiPropertyOptional({ description: 'URL to the featured image' })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({ description: 'Whether the post is published' })
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
