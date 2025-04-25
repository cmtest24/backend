import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFaqDto {
  @ApiProperty({ description: 'Tiêu đề FAQ' })
  @IsString()
  tieuDe: string;

  @ApiProperty({ description: 'Nội dung FAQ' })
  @IsString()
  noiDung: string;
}