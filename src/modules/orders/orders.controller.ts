import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  UseGuards,
  Request,
  Query,
  Delete,
  HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { CreateGuestOrderDto } from './dto/create-guest-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/constants/role.enum';

@ApiTags('orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a new order' })
  @ApiResponse({ status: 201, description: 'Order created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input or insufficient stock' })
  @ApiBearerAuth()
  create(@Request() req, @Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(req.user.id, createOrderDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all orders (no authentication required)' })
  @ApiResponse({ status: 200, description: 'Return all orders' })
  findAllOrders() {
    return this.ordersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order by ID (no authentication required)' })
  @ApiResponse({ status: 200, description: 'Return the order' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  findOne(@Param('id') id: string) {
    return this.ordersService.findOneAdmin(id);
  }

  @Put(':id/cancel')
  @ApiOperation({ summary: 'Cancel an order (no authentication required)' })
  @ApiResponse({ status: 200, description: 'Order cancelled successfully' })
  @ApiResponse({ status: 400, description: 'Order cannot be cancelled' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  cancel(@Param('id') id: string, @Body('reason') reason?: string) {
    return this.ordersService.cancelOrderNoAuth(id, reason);
  }

  @Get('admin/orders')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get all orders (admin only)' })
  @ApiResponse({ status: 200, description: 'Return all orders' })
  @ApiBearerAuth()
  findAll() {
    return this.ordersService.findAll();
  }

  @Put('admin/orders/:id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update order status (admin only)' })
  @ApiResponse({ status: 200, description: 'Order status updated successfully' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  @ApiBearerAuth()
  updateStatus(
    @Param('id') id: string,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateStatus(id, updateOrderStatusDto);
  }

  @Post('guest')
  @ApiOperation({ summary: 'Create a new guest order (no authentication required)' })
  @ApiResponse({ status: 201, description: 'Guest order created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input or insufficient stock' })
  createGuestOrder(@Body() createGuestOrderDto: CreateGuestOrderDto) {
    return this.ordersService.createGuestOrder(createGuestOrderDto);
  }

  @Get('guest/:id')
  @ApiOperation({ summary: 'Get guest order by ID (no authentication required)' })
  @ApiResponse({ status: 200, description: 'Return the guest order' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  findOneGuest(@Param('id') id: string) {
    return this.ordersService.findOneGuest(id);
  }

  @Get('guest/track-by-phone')
  @ApiOperation({ summary: 'Get all guest orders by phone number (no authentication required)' })
  @ApiResponse({ status: 200, description: 'Return guest orders' })
  findAllGuestOrders(@Query('phoneNumber') phoneNumber: string) {
    return this.ordersService.findAllGuestOrders(phoneNumber);
  }
  
  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete an order (no authentication required)' })
  @ApiResponse({ status: 204, description: 'Order deleted successfully' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  deleteOrder(@Param('id') id: string) {
    return this.ordersService.deleteOrder(id);
  }
}
