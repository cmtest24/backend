import { IsNotEmpty, IsString, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateVideoDto {
  @ApiProperty({ description: 'Title of the video' })
  @IsNotEmpty()
  @IsString()
  tieuDe: string;

  @ApiProperty({ description: 'YouTube link of the video' })
  @IsNotEmpty()
  @IsString()
  @IsUrl()
  linkYtb: string;
}