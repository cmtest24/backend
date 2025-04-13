import { 
  Controller, 
  Get, 
  Post, 
  Put,
  Body, 
  Param, 
  Query,
  UseGuards,
  Req,
  ParseIntPipe
} from '@nestjs/common';
import { 
  ApiBearerAuth, 
  ApiTags, 
  ApiOperation, 
  ApiResponse,
  ApiQuery 
} from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PaginationOptions } from '../../common/interfaces/pagination.interface';

@ApiTags('Orders')
@Controller('orders')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  @ApiOperation({ summary: 'Get all orders for the current user' })
  @ApiResponse({ status: 200, description: 'Return all orders.' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'sortBy', required: false, type: String })
  @ApiQuery({ name: 'order', required: false, enum: ['ASC', 'DESC'] })
  @ApiQuery({ name: 'status', required: false, type: String })
  findAll(
    @Req() req,
    @Query() paginationOptions: PaginationOptions,
    @Query('status') status?: string,
  ) {
    return this.ordersService.findAllByUser(req.user.id, paginationOptions, status);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order by ID' })
  @ApiResponse({ status: 200, description: 'Return the order.' })
  @ApiResponse({ status: 404, description: 'Order not found.' })
  findOne(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.ordersService.findOneByUser(id, req.user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new order' })
  @ApiResponse({ status: 201, description: 'Order created successfully.' })
  create(@Body() createOrderDto: CreateOrderDto, @Req() req) {
    return this.ordersService.create(createOrderDto, req.user.id);
  }

  @Put(':id/cancel')
  @ApiOperation({ summary: 'Cancel an order' })
  @ApiResponse({ status: 200, description: 'Order cancelled successfully.' })
  @ApiResponse({ status: 400, description: 'Order cannot be cancelled.' })
  @ApiResponse({ status: 404, description: 'Order not found.' })
  cancel(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.ordersService.cancelOrder(id, req.user.id);
  }
}
