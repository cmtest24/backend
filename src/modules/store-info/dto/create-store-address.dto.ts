import { IsNotEmpty, IsString, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateStoreAddressDto {
  @ApiProperty({ description: 'Tên chi nhánh cửa hàng' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'Địa chỉ đường/phố' })
  @IsNotEmpty()
  @IsString()
  street: string;

  @ApiProperty({ description: 'Phường/Xã' })
  @IsNotEmpty()
  @IsString()
  ward: string;

  @ApiProperty({ description: 'Quận/Huyện' })
  @IsNotEmpty()
  @IsString()
  district: string;

  @ApiProperty({ description: 'Thành phố/Tỉnh' })
  @IsNotEmpty()
  @IsString()
  city: string;

  @ApiPropertyOptional({ description: 'Mã bưu điện' })
  @IsOptional()
  @IsString()
  zipCode?: string;

  @ApiProperty({ description: 'Số điện thoại chi nhánh' })
  @IsNotEmpty()
  @IsString()
  phoneNumber: string;

  @ApiPropertyOptional({ description: 'Email chi nhánh' })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({ description: 'Đường dẫn Google Map' })
  @IsOptional()
  @IsString()
  googleMapUrl?: string;

  @ApiPropertyOptional({ description: 'Đánh dấu là chi nhánh chính' })
  @IsOptional()
  @IsBoolean()
  isMainBranch?: boolean;

  @ApiPropertyOptional({ description: 'Giờ mở cửa' })
  @IsOptional()
  @IsString()
  openingHours?: string;
}
