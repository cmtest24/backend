import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a new payment' })
  @ApiResponse({ status: 201, description: 'Payment created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiBearerAuth()
  create(@Request() req, @Body() createPaymentDto: CreatePaymentDto) {
    return this.paymentsService.create(req.user.id, createPaymentDto);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get payment status' })
  @ApiResponse({ status: 200, description: 'Return the payment status' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  @ApiBearerAuth()
  findOne(@Param('id') id: string) {
    return this.paymentsService.findOne(id);
  }
}
