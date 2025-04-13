import { IsNotEmpty, IsNumber, IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PaymentProvider } from '../entities/payment.entity';

export class CreatePaymentDto {
  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsNumber()
  orderId: number;

  @ApiProperty({ enum: PaymentProvider, example: PaymentProvider.VNPAY })
  @IsNotEmpty()
  @IsEnum(PaymentProvider)
  provider: PaymentProvider;

  @ApiProperty({ example: 'https://callback-url.com', required: false })
  @IsOptional()
  @IsString()
  returnUrl?: string;
}
