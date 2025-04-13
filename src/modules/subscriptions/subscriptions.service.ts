import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subscription } from './entities/subscription.entity';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectRepository(Subscription)
    private subscriptionsRepository: Repository<Subscription>,
  ) {}

  async create(createSubscriptionDto: CreateSubscriptionDto): Promise<Subscription> {
    try {
      // Check if email already exists
      const existingSubscription = await this.subscriptionsRepository.findOne({
        where: { email: createSubscriptionDto.email },
      });

      if (existingSubscription) {
        // If subscription exists but is inactive, reactivate it
        if (!existingSubscription.isActive) {
          existingSubscription.isActive = true;
          existingSubscription.source = createSubscriptionDto.source || existingSubscription.source;
          return this.subscriptionsRepository.save(existingSubscription);
        }
        
        throw new ConflictException('Email is already subscribed');
      }

      // Create new subscription
      const subscription = this.subscriptionsRepository.create(createSubscriptionDto);
      return this.subscriptionsRepository.save(subscription);
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw error;
    }
  }

  async findAll(): Promise<Subscription[]> {
    return this.subscriptionsRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Subscription> {
    const subscription = await this.subscriptionsRepository.findOne({
      where: { id },
    });

    if (!subscription) {
      throw new NotFoundException(`Subscription with ID ${id} not found`);
    }

    return subscription;
  }

  async remove(id: string): Promise<void> {
    const subscription = await this.findOne(id);

    // Instead of hard delete, just mark as inactive
    subscription.isActive = false;
    await this.subscriptionsRepository.save(subscription);
  }
}
