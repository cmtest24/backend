import { 
  IsNotEmpty, 
  IsString, 
  IsOptional, 
  IsBoolean, 
  MaxLength 
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAddressDto {
  @ApiProperty({ example: 'Nguyen Van A' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  fullName: string;

  @ApiProperty({ example: '+84123456789' })
  @IsNotEmpty()
  @IsString()
  phone: string;

  @ApiProperty({ example: '123 Main Street' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  addressLine1: string;

  @ApiProperty({ example: 'Apartment 4B', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  addressLine2?: string;

  @ApiProperty({ example: 'Ho Chi Minh City' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  city: string;

  @ApiProperty({ example: 'District 1' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  district: string;

  @ApiProperty({ example: 'Ben Nghe Ward', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  ward?: string;

  @ApiProperty({ example: '70000', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  postalCode?: string;

  @ApiProperty({ example: false, required: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @ApiProperty({ example: 'Call before delivery', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}
