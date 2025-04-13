import { IsNotEmpty, IsEmail, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSubscriptionDto {
  @ApiProperty({ description: 'Email address to subscribe' })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ description: 'Source of the subscription (e.g., footer, popup)' })
  @IsOptional()
  @IsString()
  source?: string;
}
