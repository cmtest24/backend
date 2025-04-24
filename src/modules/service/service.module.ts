import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceService } from './service.service';
import { ServiceController } from './service.controller';
import { Service } from './service.entity';
import { Category } from '../categories/entities/category.entity'; // Import Category entity

@Module({
  imports: [
    TypeOrmModule.forFeature([Service, Category]) // Add Category entity to imports
  ],
  controllers: [ServiceController],
  providers: [ServiceService],
})
export class ServiceModule {}