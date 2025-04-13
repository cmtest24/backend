import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { WishlistService } from './wishlist.service';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('wishlist')
@Controller('wishlist')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Post()
  @ApiOperation({ summary: 'Add product to wishlist' })
  @ApiResponse({ status: 201, description: 'Product added to wishlist successfully' })
  @ApiResponse({ status: 409, description: 'Product already in wishlist' })
  create(@Request() req, @Body() createWishlistDto: CreateWishlistDto) {
    return this.wishlistService.create(req.user.id, createWishlistDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get user wishlist' })
  @ApiResponse({ status: 200, description: 'Return user wishlist' })
  findAll(@Request() req) {
    return this.wishlistService.findAllByUser(req.user.id);
  }

  @Delete(':productId')
  @ApiOperation({ summary: 'Remove product from wishlist' })
  @ApiResponse({ status: 200, description: 'Product removed from wishlist successfully' })
  @ApiResponse({ status: 404, description: 'Product not found in wishlist' })
  remove(@Request() req, @Param('productId') productId: string) {
    return this.wishlistService.remove(req.user.id, productId);
  }
}
