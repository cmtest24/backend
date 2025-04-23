import { IsOptional, IsString, IsUrl } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

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
}