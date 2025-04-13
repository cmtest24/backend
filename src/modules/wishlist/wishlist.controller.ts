import { 
  Controller, 
  Get, 
  Post, 
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
import { WishlistService } from './wishlist.service';
import { AddToWishlistDto } from './dto/add-to-wishlist.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Wishlist')
@Controller('wishlist')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Get()
  @ApiOperation({ summary: 'Get all wishlist items for the current user' })
  @ApiResponse({ status: 200, description: 'Return all wishlist items.' })
  findAll(@Req() req) {
    return this.wishlistService.findAllByUser(req.user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Add a product to wishlist' })
  @ApiResponse({ status: 201, description: 'Product added to wishlist successfully.' })
  @ApiResponse({ status: 400, description: 'Product already in wishlist or invalid product.' })
  create(@Body() addToWishlistDto: AddToWishlistDto, @Req() req) {
    return this.wishlistService.create(addToWishlistDto, req.user.id);
  }

  @Delete(':productId')
  @ApiOperation({ summary: 'Remove a product from wishlist' })
  @ApiResponse({ status: 200, description: 'Product removed from wishlist successfully.' })
  @ApiResponse({ status: 404, description: 'Wishlist item not found.' })
  remove(@Param('productId', ParseIntPipe) productId: number, @Req() req) {
    return this.wishlistService.remove(productId, req.user.id);
  }
}
