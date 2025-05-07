import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { StoreInfoService } from './store-info.service';
import { CreateStoreInfoDto } from './dto/create-store-info.dto';
import { UpdateStoreInfoDto } from './dto/update-store-info.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/constants/role.enum';

@ApiTags('store-info')
@Controller('store-info')
export class StoreInfoController {
  constructor(private readonly storeInfoService: StoreInfoService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Create store information' })
  @ApiResponse({ status: 201, description: 'Store information created successfully' })
  @ApiBearerAuth()
  create(@Body() createStoreInfoDto: CreateStoreInfoDto) {
    return this.storeInfoService.create(createStoreInfoDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get store information' })
  @ApiResponse({ status: 200, description: 'Return store information' })
  findOne() {
    return this.storeInfoService.findOne();
  }

  @Put()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update store information including addresses' })
  @ApiResponse({ 
    status: 200, 
    description: 'Store information updated successfully',
    type: UpdateStoreInfoDto
  })
  @ApiResponse({ status: 404, description: 'Store information not found' })
  @ApiBearerAuth()
  update(@Body() updateStoreInfoDto: UpdateStoreInfoDto) {
    return this.storeInfoService.update(updateStoreInfoDto);
  }

  @Delete()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete store information' })
  @ApiResponse({ status: 200, description: 'Store information deleted successfully' })
  @ApiBearerAuth()
  remove() {
    return this.storeInfoService.remove();
  }

  // API PUT /api/store-info cho phép cập nhật tất cả thông tin cửa hàng, bao gồm mảng addresses
}