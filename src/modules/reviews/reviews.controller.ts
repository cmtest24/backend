import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('reviews')
@Controller()
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post('products/:id/reviews')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a product review' })
  @ApiResponse({ status: 201, description: 'Review created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request or already reviewed' })
  @ApiBearerAuth()
  create(
    @Request() req,
    @Param('id') productId: string,
    @Body() createReviewDto: CreateReviewDto,
  ) {
    // Ensure productId is set correctly
    createReviewDto.productId = productId;
    return this.reviewsService.create(req.user.id, createReviewDto);
  }

  @Get('products/:id/reviews')
  @ApiOperation({ summary: 'Get all reviews for a product' })
  @ApiResponse({ status: 200, description: 'Return product reviews' })
  findAllByProduct(@Param('id') productId: string) {
    return this.reviewsService.findAllByProduct(productId);
  }

  @Put('reviews/:id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update a review' })
  @ApiResponse({ status: 200, description: 'Review updated successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Review not found' })
  @ApiBearerAuth()
  update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateReviewDto: UpdateReviewDto,
  ) {
    return this.reviewsService.update(id, req.user.id, req.user.role, updateReviewDto);
  }

  @Delete('reviews/:id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete a review' })
  @ApiResponse({ status: 200, description: 'Review deleted successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Review not found' })
  @ApiBearerAuth()
  remove(@Request() req, @Param('id') id: string) {
    return this.reviewsService.remove(id, req.user.id, req.user.role);
  }
}
