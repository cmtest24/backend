import { 
  Injectable, 
  NotFoundException, 
  BadRequestException, 
  ForbiddenException,
  ConflictException 
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ProductsService } from '../products/products.service';
import { PaginationOptions, PaginatedResult } from '../../common/interfaces/pagination.interface';
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '../../common/constants';
import { UserRole } from '../users/entities/user.entity';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private reviewsRepository: Repository<Review>,
    private productsService: ProductsService,
  ) {}

  async findAll(
    options: PaginationOptions,
    productId?: number,
    userId?: number
  ): Promise<PaginatedResult<Review>> {
    const page = options.page || 1;
    const limit = Math.min(options.limit || DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);
    
    // Build query conditions
    const whereConditions: any = {};
    
    if (productId) {
      whereConditions.productId = productId;
    }
    
    if (userId) {
      whereConditions.userId = userId;
    }
    
    const [reviews, total] = await this.reviewsRepository.findAndCount({
      where: whereConditions,
      order: { createdAt: 'DESC' },
      take: limit,
      skip: (page - 1) * limit,
      relations: ['user', 'product'],
    });
    
    const totalPages = Math.ceil(total / limit);
    
    return {
      data: reviews,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  async findAllForProduct(
    productId: number,
    options: PaginationOptions
  ): Promise<PaginatedResult<Review>> {
    // Verify product exists
    await this.productsService.findOne(productId);
    
    const page = options.page || 1;
    const limit = Math.min(options.limit || DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);
    
    const [reviews, total] = await this.reviewsRepository.findAndCount({
      where: { productId, isVisible: true },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: (page - 1) * limit,
      relations: ['user'],
    });
    
    const totalPages = Math.ceil(total / limit);
    
    return {
      data: reviews,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  async findOne(id: number): Promise<Review> {
    const review = await this.reviewsRepository.findOne({
      where: { id },
      relations: ['user', 'product'],
    });
    
    if (!review) {
      throw new NotFoundException(`Review with ID ${id} not found`);
    }
    
    return review;
  }

  async create(createReviewDto: CreateReviewDto, userId: number): Promise<Review> {
    const { productId } = createReviewDto;
    
    // Verify product exists
    await this.productsService.findOne(productId);
    
    // Check if user has already reviewed this product
    const existingReview = await this.reviewsRepository.findOne({
      where: { userId, productId },
    });
    
    if (existingReview) {
      throw new ConflictException('You have already reviewed this product');
    }
    
    // Create review
    const review = this.reviewsRepository.create({
      ...createReviewDto,
      userId,
    });
    
    const savedReview = await this.reviewsRepository.save(review);
    
    // Update product rating
    await this.productsService.updateProductRating(productId);
    
    return savedReview;
  }

  async update(
    id: number, 
    updateReviewDto: UpdateReviewDto, 
    userId: number,
    userRole: UserRole
  ): Promise<Review> {
    const review = await this.findOne(id);
    
    // Check if user is allowed to update (owner or admin)
    if (review.userId !== userId && userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('You do not have permission to update this review');
    }
    
    // Update review
    const updatedReview = await this.reviewsRepository.save({
      ...review,
      ...updateReviewDto,
    });
    
    // Update product rating if rating changed
    if (updateReviewDto.rating) {
      await this.productsService.updateProductRating(review.productId);
    }
    
    return updatedReview;
  }

  async remove(id: number, userId: number, userRole: UserRole): Promise<{ message: string }> {
    const review = await this.findOne(id);
    
    // Check if user is allowed to delete (owner or admin)
    if (review.userId !== userId && userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('You do not have permission to delete this review');
    }
    
    // Delete review
    await this.reviewsRepository.remove(review);
    
    // Update product rating
    await this.productsService.updateProductRating(review.productId);
    
    return { message: 'Review deleted successfully' };
  }
}
