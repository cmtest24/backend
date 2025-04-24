import { Controller, Get, Post, Body, Param, Delete, Put } from '@nestjs/common';
import { BannersService } from './banners.service';
import { CreateBannerDto } from './dto/create-banner.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('banners')
@Controller('banners')
export class BannersController {
  constructor(private readonly bannersService: BannersService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo banner mới' })
  @ApiResponse({ status: 201, description: 'Banner đã được tạo thành công.' })
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
  @ApiOperation({ summary: 'Cập nhật banner theo ID' })
  @ApiResponse({ status: 200, description: 'Banner đã được cập nhật thành công.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy banner.' })
  update(@Param('id') id: string, @Body() updateBannerDto: CreateBannerDto) {
    return this.bannersService.update(+id, updateBannerDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa banner theo ID' })
  @ApiResponse({ status: 200, description: 'Banner đã được xóa thành công.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy banner.' })
  remove(@Param('id') id: string) {
    return this.bannersService.remove(+id);
  }
}