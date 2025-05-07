import { IsOptional, IsString, IsUrl, IsArray, ValidateNested } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateStoreInfoDto {
  @ApiPropertyOptional({ description: 'Store logo URL' })
  @IsOptional()
  @IsString()
  @IsUrl()
  logo?: string;

  @ApiPropertyOptional({ description: 'Store favicon URL' })
  @IsOptional()
  @IsString()
  @IsUrl()
  favicon?: string;

  @ApiPropertyOptional({ description: 'Facebook page URL' })
  @IsOptional()
  @IsString()
  @IsUrl()
  facebook?: string;

  @ApiPropertyOptional({ description: 'YouTube channel URL' })
  @IsOptional()
  @IsString()
  @IsUrl()
  youtube?: string;

  @ApiPropertyOptional({ description: 'Google Map embed URL' })
  @IsOptional()
  @IsString()
  googleMap?: string; // Google Map embed URL might not be a standard URL

  @ApiPropertyOptional({ description: 'Store hotline number' })
  @IsOptional()
  @IsString()
  hotline?: string;

  @ApiPropertyOptional({ description: 'Zalo contact information' })
  @IsOptional()
  @IsString()
  zalo?: string;

  @ApiPropertyOptional({ description: 'Store working hours' })
  @IsOptional()
  @IsString()
  workingHours?: string;

  @ApiPropertyOptional({ description: 'Store addresses', type: 'array', items: { type: 'object', properties: { name: { type: 'string' }, phoneNumber: { type: 'string' }, address: { type: 'string' } } } })
  @IsOptional()
  @IsArray()
  addresses?: { name: string; phoneNumber: string; address: string }[];
}