import { IsNotEmpty, IsString, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAddressDto {
  @ApiProperty({ description: 'Full name of the recipient' })
  @IsNotEmpty()
  @IsString()
  fullName: string;

  @ApiProperty({ description: 'Phone number of the recipient' })
  @IsNotEmpty()
  @IsString()
  phoneNumber: string;

  @ApiProperty({ description: 'Street address including house/apartment number' })
  @IsNotEmpty()
  @IsString()
  street: string;

  @ApiProperty({ description: 'Ward/community' })
  @IsNotEmpty()
  @IsString()
  ward: string;

  @ApiProperty({ description: 'District' })
  @IsNotEmpty()
  @IsString()
  district: string;

  @ApiProperty({ description: 'City/province' })
  @IsNotEmpty()
  @IsString()
  city: string;

  @ApiPropertyOptional({ description: 'Postal/zip code' })
  @IsOptional()
  @IsString()
  zipCode?: string;

  @ApiPropertyOptional({ description: 'Set as default address' })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
