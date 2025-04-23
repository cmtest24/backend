import { Controller, Get, Post, Body, Param, Delete, Put, UseGuards } from '@nestjs/common';
import { BannersService } from './banners.service';
import { CreateBannerDto } from './dto/create-banner.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/constants/role.enum';

@ApiTags('banners')
@Controller('banners')
export class BannersController {
  constructor(private readonly bannersService: BannersService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Tạo banner mới (admin only)' })
  @ApiResponse({ status: 201, description: 'Banner đã được tạo thành công.' })
  @ApiBearerAuth()
  create(@Body() createBannerDto: CreateBannerDto) {
    return this.bannersService.create(createBannerDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy tất cả banner' })
  @ApiResponse({ status: 200, description: 'Trả về danh sách tất cả banner.' })
  findAll() {
    return this.bannersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy banner theo ID' })
  @ApiResponse({ status: 200, description: 'Trả về banner theo ID.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy banner.' })
  findOne(@Param('id') id: string) {
    return this.bannersService.findOne(+id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Cập nhật banner theo ID (admin only)' })
  @ApiResponse({ status: 200, description: 'Banner đã được cập nhật thành công.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy banner.' })
  @ApiBearerAuth()
  update(@Param('id') id: string, @Body() updateBannerDto: CreateBannerDto) {
    return this.bannersService.update(+id, updateBannerDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Xóa banner theo ID (admin only)' })
  @ApiResponse({ status: 200, description: 'Banner đã được xóa thành công.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy banner.' })
  @ApiBearerAuth()
  remove(@Param('id') id: string) {
    return this.bannersService.remove(+id);
  }
}