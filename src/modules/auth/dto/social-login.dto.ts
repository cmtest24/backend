import { IsNotEmpty, IsString, IsEnum, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class SocialUserData {
  @ApiProperty({ example: '12345' })
  @IsNotEmpty()
  @IsString()
  id: string;

  @ApiProperty({ example: 'user@example.com' })
  @IsNotEmpty()
  @IsString()
  email: string;

  @ApiProperty({ example: 'John Doe' })
  @IsNotEmpty()
  @IsString()
  name: string;
}

export enum SocialProvider {
  GOOGLE = 'google',
  FACEBOOK = 'facebook',
}

export class SocialLoginDto {
  @ApiProperty({ enum: SocialProvider, example: SocialProvider.GOOGLE })
  @IsNotEmpty()
  @IsEnum(SocialProvider)
  provider: SocialProvider;

  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  @IsNotEmpty()
  @IsString()
  accessToken: string;

  @ApiProperty({ type: SocialUserData })
  @IsNotEmpty()
  @IsObject()
  @ValidateNested()
  @Type(() => SocialUserData)
  userData: SocialUserData;
}
