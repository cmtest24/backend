import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { StoreInfoService } from './store-info.service';
import { CreateStoreInfoDto } from './dto/create-store-info.dto';
import { UpdateStoreInfoDto } from './dto/update-store-info.dto';

@Controller('store-info')
export class StoreInfoController {
  constructor(private readonly storeInfoService: StoreInfoService) {}

  @Post()
  create(@Body() createStoreInfoDto: CreateStoreInfoDto) {
    return this.storeInfoService.create(createStoreInfoDto);
  }

  @Get()
  findOne() {
    return this.storeInfoService.findOne();
  }

  @Put()
  update(@Body() updateStoreInfoDto: UpdateStoreInfoDto) {
    return this.storeInfoService.update(updateStoreInfoDto);
  }

  @Delete()
  remove() {
    return this.storeInfoService.remove();
  }
}