import { Controller, Get, Post, Body, Put, Param, Delete, ParseIntPipe, Query } from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';
import { ServiceService } from './service.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { Service } from './service.entity';

@Controller('services')
export class ServiceController {
  constructor(private readonly serviceService: ServiceService) {}

  @Post()
  create(@Body() createServiceDto: CreateServiceDto): Promise<Service> {
    return this.serviceService.create(createServiceDto);
  }

  @Get()
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Số lượng dịch vụ tối đa muốn lấy (mặc định 10)' })
  @ApiQuery({ name: 'offset', required: false, type: Number, description: 'Số lượng dịch vụ muốn bỏ qua (mặc định 0)' })
  @ApiQuery({ name: 'categoryId', required: false, type: String, description: 'ID của danh mục để lọc dịch vụ' })
  findAll(
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
    @Query('categoryId') categoryId: string | undefined = undefined,
  ): Promise<Service[]> {
    const parsedLimit = limit ? parseInt(limit as any, 10) : 10; // Default limit to 10
    const parsedOffset = offset ? parseInt(offset as any, 10) : 0;
    return this.serviceService.findAll(parsedLimit, parsedOffset, categoryId);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Service> {
    return this.serviceService.findOne(id);
  }


  @Put(':id')
  update(@Param('id') id: string, @Body() updateServiceDto: UpdateServiceDto): Promise<Service> {
    return this.serviceService.update(id, updateServiceDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.serviceService.remove(id);
  }
}