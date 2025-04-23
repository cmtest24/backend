import { IsOptional, IsString, IsNumber, Min, Max, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum VideoSortField {
  TIEU_DE = 'tieuDe',
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
}

export enum VideoSortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

export class QueryVideoDto {
  @ApiPropertyOptional({ description: 'Search term for video title' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Field to sort by', enum: VideoSortField, default: VideoSortField.CREATED_AT })
  @IsOptional()
  @IsEnum(VideoSortField)
  sortBy?: VideoSortField = VideoSortField.CREATED_AT;

  @ApiPropertyOptional({ description: 'Sort order', enum: VideoSortOrder, default: VideoSortOrder.DESC })
  @IsOptional()
  @IsEnum(VideoSortOrder)
  sortOrder?: VideoSortOrder = VideoSortOrder.DESC;

  @ApiPropertyOptional({ description: 'Page number for pagination', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Number of items per page', default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(50)
  limit?: number = 10;
}