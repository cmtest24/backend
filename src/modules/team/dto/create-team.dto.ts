import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTeamDto {
  @ApiProperty({ description: 'Tên thành viên nhóm' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Đường dẫn ảnh thành viên nhóm' })
  @IsString()
  @IsNotEmpty()
  image: string;

  @ApiProperty({ description: 'Mô tả về thành viên nhóm' })
  @IsString()
  @IsNotEmpty()
  description: string;
}