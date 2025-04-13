import { 
  IsNotEmpty, 
  IsString, 
  IsEnum, 
  IsNumber, 
  IsOptional, 
  IsDate, 
  IsBoolean,
  Min,
  Max
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { PromotionType } from '../entities/promotion.entity';

export class CreatePromotionDto {
  @ApiProperty({ description: 'Name of the promotion' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'Unique promotion code' })
  @IsNotEmpty()
  @IsString()
  code: string;

  @ApiPropertyOptional({ description: 'Description of the promotion' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Type of promotion', enum: PromotionType })
  @IsNotEmpty()
  @IsEnum(PromotionType)
  type: PromotionType;

  @ApiProperty({ description: 'Amount of the discount (percentage or fixed)' })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Max(100, { message: 'Percentage discount cannot exceed 100%' })
  amount: number;

  @ApiPropertyOptional({ description: 'Minimum purchase amount required' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minimumPurchase?: number;

  @ApiPropertyOptional({ description: 'Maximum number of times this promotion can be used' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  usageLimit?: number;

  @ApiPropertyOptional({ description: 'Whether this promotion is active', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ description: 'Start date of the promotion' })
  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  startDate: Date;

  @ApiProperty({ description: 'End date of the promotion' })
  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  endDate: Date;
}
