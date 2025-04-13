import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PromotionsService } from './promotions.service';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/constants/role.enum';

@ApiTags('promotions')
@Controller('promotions')
export class PromotionsController {
  constructor(private readonly promotionsService: PromotionsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Create a new promotion (admin only)' })
  @ApiResponse({ status: 201, description: 'Promotion created successfully' })
  @ApiResponse({ status: 409, description: 'Promotion with this code already exists' })
  @ApiBearerAuth()
  create(@Body() createPromotionDto: CreatePromotionDto) {
    return this.promotionsService.create(createPromotionDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all active promotions' })
  @ApiResponse({ status: 200, description: 'Return all active promotions' })
  findAll() {
    return this.promotionsService.findActivePromotions();
  }

  @Get(':code')
  @ApiOperation({ summary: 'Check if a promotion code is valid' })
  @ApiResponse({ status: 200, description: 'Return the promotion if valid' })
  @ApiResponse({ status: 404, description: 'Promotion not found or invalid' })
  findByCode(@Param('code') code: string) {
    return this.promotionsService.validatePromotion(code);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete a promotion (admin only)' })
  @ApiResponse({ status: 200, description: 'Promotion deleted successfully' })
  @ApiResponse({ status: 404, description: 'Promotion not found' })
  @ApiBearerAuth()
  remove(@Param('id') id: string) {
    return this.promotionsService.remove(id);
  }
}
