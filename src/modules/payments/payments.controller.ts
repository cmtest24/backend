import { 
  Controller, 
  Post, 
  Get, 
  Body, 
  Param, 
  UseGuards,
  Req,
  ParseIntPipe,
  Query
} from '@nestjs/common';
import { 
  ApiBearerAuth, 
  ApiTags, 
  ApiOperation, 
  ApiResponse 
} from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a payment' })
  @ApiResponse({ status: 201, description: 'Payment created successfully.' })
  @ApiResponse({ status: 404, description: 'Order not found.' })
  create(@Body() createPaymentDto: CreatePaymentDto, @Req() req) {
    return this.paymentsService.create(createPaymentDto, req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get payment status' })
  @ApiResponse({ status: 200, description: 'Return the payment status.' })
  @ApiResponse({ status: 404, description: 'Payment not found.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.paymentsService.findOne(id);
  }
  
  // Callback from payment provider
  @Get('callback')
  @ApiOperation({ summary: 'Payment callback from provider' })
  handleCallback(@Query() query: any) {
    return this.paymentsService.handlePaymentCallback(query);
  }
}
