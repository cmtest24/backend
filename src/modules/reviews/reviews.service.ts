import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ProductsService } from '../products/products.service';
import { Role } from '../../common/constants/role.enum';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private reviewsRepository: Repository<Review>,
    private productsService: ProductsService,
  ) {}

  async create(userId: string, createReviewDto: CreateReviewDto): Promise<Review> {
    // Check if product exists
    const product = await this.productsService.findOne(createReviewDto.productId);
    
    // Check if user already reviewed this product
    const existingReview = await this.reviewsRepository.findOne({
      where: { userId, productId: createReviewDto.productId },
    });
    
    if (existingReview) {
      throw new BadRequestException('You have already reviewed this product');
    }
    
    // Create the review
    const review = this.reviewsRepository.create({
      userId,
      productId: createReviewDto.productId,
      rating: createReviewDto.rating,
      comment: createReviewDto.comment,
      imageUrl: createReviewDto.imageUrl,
    });
    
    const savedReview = await this.reviewsRepository.save(review);
    
    // Update product average rating
    return savedReview;
  }

  async findAllByProduct(productId: string): Promise<Review[]> {
    // Verify product exists
    await this.productsService.findOne(productId);
    
    return this.reviewsRepository.find({
      where: { productId, isPublished: true },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Review> {
    const review = await this.reviewsRepository.findOne({
      where: { id },
      relations: ['user', 'product'],
    });

    if (!review) {
      throw new NotFoundException(`Review with ID ${id} not found`);
    }

    return review;
  }

  async update(id: string, userId: string, userRole: Role, updateReviewDto: UpdateReviewDto): Promise<Review> {
    const review = await this.findOne(id);
    
    // Only the review owner or admin can update the review
    if (review.userId !== userId && userRole !== Role.ADMIN) {
      throw new ForbiddenException('You do not have permission to update this review');
    }
    
    // Regular users cannot update isPublished
    if (updateReviewDto.isPublished !== undefined && userRole !== Role.ADMIN) {
      delete updateReviewDto.isPublished;
    }
    
    // Update the review
    Object.assign(review, updateReviewDto);
    
    const updatedReview = await this.reviewsRepository.save(review);
    
    // Update product average rating if rating changed
    if (updateReviewDto.rating) {
    }
    
    return updatedReview;
  }

  async remove(id: string, userId: string, userRole: Role): Promise<void> {
    const review = await this.findOne(id);
    
    // Only the review owner or admin can delete the review
    if (review.userId !== userId && userRole !== Role.ADMIN) {
      throw new ForbiddenException('You do not have permission to delete this review');
    }
    
    const productId = review.productId;
    
    await this.reviewsRepository.remove(review);
    
    // Update product average rating
  }
}
