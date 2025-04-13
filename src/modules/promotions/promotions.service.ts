import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { Promotion } from './entities/promotion.entity';
import { CreatePromotionDto } from './dto/create-promotion.dto';

@Injectable()
export class PromotionsService {
  constructor(
    @InjectRepository(Promotion)
    private promotionsRepository: Repository<Promotion>,
  ) {}

  async create(createPromotionDto: CreatePromotionDto): Promise<Promotion> {
    try {
      // Check if promotion code already exists
      const existingPromotion = await this.promotionsRepository.findOne({
        where: { code: createPromotionDto.code },
      });

      if (existingPromotion) {
        throw new ConflictException('Promotion with this code already exists');
      }

      // Validate dates
      if (new Date(createPromotionDto.endDate) <= new Date(createPromotionDto.startDate)) {
        throw new BadRequestException('End date must be after start date');
      }

      const promotion = this.promotionsRepository.create(createPromotionDto);
      return this.promotionsRepository.save(promotion);
    } catch (error) {
      if (error instanceof ConflictException || error instanceof BadRequestException) {
        throw error;
      }
      throw error;
    }
  }

  async findAll(): Promise<Promotion[]> {
    return this.promotionsRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findActivePromotions(): Promise<Promotion[]> {
    const now = new Date();
    
    return this.promotionsRepository.find({
      where: {
        isActive: true,
        startDate: LessThanOrEqual(now),
        endDate: MoreThanOrEqual(now),
      },
      order: { createdAt: 'DESC' },
    });
  }

  async findByCode(code: string): Promise<Promotion> {
    const promotion = await this.promotionsRepository.findOne({
      where: { code },
    });

    if (!promotion) {
      throw new NotFoundException(`Promotion with code ${code} not found`);
    }

    return promotion;
  }

  async validatePromotion(code: string, subtotal?: number): Promise<Promotion | null> {
    try {
      const promotion = await this.findByCode(code);
      const now = new Date();
      
      // Check if promotion is valid
      if (
        !promotion.isActive ||
        now < promotion.startDate ||
        now > promotion.endDate
      ) {
        return null;
      }
      
      // Check usage limit
      if (promotion.usageLimit && promotion.usageCount >= promotion.usageLimit) {
        return null;
      }
      
      // Check minimum purchase
      if (subtotal && promotion.minimumPurchase && subtotal < promotion.minimumPurchase) {
        return null;
      }
      
      return promotion;
    } catch (error) {
      if (error instanceof NotFoundException) {
        return null;
      }
      throw error;
    }
  }

  async incrementUsage(code: string): Promise<void> {
    const promotion = await this.findByCode(code);
    promotion.usageCount += 1;
    await this.promotionsRepository.save(promotion);
  }

  async remove(id: string): Promise<void> {
    const promotion = await this.promotionsRepository.findOne({
      where: { id },
    });

    if (!promotion) {
      throw new NotFoundException(`Promotion with ID ${id} not found`);
    }

    await this.promotionsRepository.remove(promotion);
  }
}
