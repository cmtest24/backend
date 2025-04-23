import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StoreInfoService } from './store-info.service';
import { StoreInfoController } from './store-info.controller';
import { StoreInfo } from './entities/store-info.entity';

@Module({
  imports: [TypeOrmModule.forFeature([StoreInfo])],
  controllers: [StoreInfoController],
  providers: [StoreInfoService],
  exports: [StoreInfoService], // Export service if needed in other modules
})
export class StoreInfoModule {}