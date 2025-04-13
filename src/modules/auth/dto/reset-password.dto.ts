import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({ description: 'Reset password token' })
  @IsNotEmpty()
  @IsString()
  token: string;

  @ApiProperty({ description: 'New password for the user account' })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;
}
