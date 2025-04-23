import { ApiProperty } from '@nestjs/swagger';

export class VideoDto {
  @ApiProperty({ description: 'Unique identifier of the video' })
  id: string;

  @ApiProperty({ description: 'Title of the video' })
  tieuDe: string;

  @ApiProperty({ description: 'YouTube link of the video' })
  linkYtb: string;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}