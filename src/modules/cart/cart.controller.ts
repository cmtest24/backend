import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  UseGuards, 
  Req,
  ParseIntPipe
} from '@nestjs/common';
import { 
  ApiBearerAuth, 
  ApiTags, 
  ApiOperation, 
  ApiResponse 
} from '@nestjs/swagger';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Cart')
@Controller('cart')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @ApiOperation({ summary: 'Get the current user\'s cart' })
  @ApiResponse({ status: 200, description: 'Return the cart with items.' })
  findAll(@Req() req) {
    return this.cartService.findAllByUser(req.user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Add a product to cart' })
  @ApiResponse({ status: 201, description: 'Product added to cart successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid product or quantity.' })
  create(@Body() addToCartDto: AddToCartDto, @Req() req) {
    return this.cartService.addToCart(addToCartDto, req.user.id);
  }

  @Put(':itemId')
  @ApiOperation({ summary: 'Update cart item quantity' })
  @ApiResponse({ status: 200, description: 'Cart item updated successfully.' })
  @ApiResponse({ status: 404, description: 'Cart item not found.' })
  update(
    @Param('itemId', ParseIntPipe) itemId: number,
    @Body() updateCartItemDto: UpdateCartItemDto,
    @Req() req,
  ) {
    return this.cartService.updateCartItem(itemId, updateCartItemDto, req.user.id);
  }

  @Delete(':itemId')
  @ApiOperation({ summary: 'Remove a product from cart' })
  @ApiResponse({ status: 200, description: 'Product removed from cart successfully.' })
  @ApiResponse({ status: 404, description: 'Cart item not found.' })
  remove(@Param('itemId', ParseIntPipe) itemId: number, @Req() req) {
    return this.cartService.removeFromCart(itemId, req.user.id);
  }
}
