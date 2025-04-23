import { ApiProperty } from '@nestjs/swagger';

export class StoreInfoDto {
  @ApiProperty({ description: 'URL to the store logo', nullable: true })
  logo: string;

  @ApiProperty({ description: 'URL to the store favicon', nullable: true })
  favicon: string;

  @ApiProperty({ description: 'Facebook page URL', nullable: true })
  facebook: string;

  @ApiProperty({ description: 'YouTube channel URL', nullable: true })
  youtube: string;

  @ApiProperty({ description: 'Google Map link', nullable: true })
  googleMap: string;

  @ApiProperty({ description: 'Store hotline number', nullable: true })
  hotline: string;

  @ApiProperty({ description: 'Zalo contact information', nullable: true })
  zalo: string;

  @ApiProperty({ description: 'Store working hours', nullable: true })
  workingHours: string;
}