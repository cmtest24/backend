import { IsNotEmpty, IsString, IsEmail, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateContactDto {
  @ApiProperty({ description: 'Full name of the contact person' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'Email address for reply' })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ description: 'Phone number of the contact person' })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiProperty({ description: 'Subject of the contact message' })
  @IsNotEmpty()
  @IsString()
  subject: string;

  @ApiProperty({ description: 'Content of the contact message' })
  @IsNotEmpty()
  @IsString()
  message: string;
}
