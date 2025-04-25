import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePolicyDto {
  @ApiProperty({ description: 'Tiêu đề chính sách' })
  @IsString()
  tieuDe: string;

  @ApiProperty({ description: 'Nội dung chính sách' })
  @IsString()
  noiDung: string;

  @ApiProperty({ description: 'Slug cho chính sách' })
  @IsString()
  slug: string;
}