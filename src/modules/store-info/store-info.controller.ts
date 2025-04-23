import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { StoreInfoService } from './store-info.service';
import { StoreInfoDto } from './dto/store-info.dto';

@ApiTags('store-info')
@Controller('store-info')
export class StoreInfoController {
  constructor(private readonly storeInfoService: StoreInfoService) {}

  @Get()
  @ApiOperation({ summary: 'Get store information' })
  @ApiResponse({ status: 200, description: 'Return store information', type: StoreInfoDto })
  async getStoreInfo(): Promise<StoreInfoDto> {
    return this.storeInfoService.getStoreInfo();
  }
}