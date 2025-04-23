import { IsOptional, IsString, IsUrl } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PartialType } from '@nestjs/swagger';
import { CreateVideoDto } from './create-video.dto';

export class UpdateVideoDto extends PartialType(CreateVideoDto) {
  @ApiPropertyOptional({ description: 'Title of the video' })
  @IsOptional()
  @IsString()
  tieuDe?: string;

  @ApiPropertyOptional({ description: 'YouTube link of the video' })
  @IsOptional()
  @IsString()
  @IsUrl()
  linkYtb?: string;
}