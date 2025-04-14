import { Module } from '@nestjs/common';
import { UploadImagesController } from './upload-images.controller';

@Module({
  controllers: [UploadImagesController],
  providers: [],
  exports: [],
})
export class UploadImagesModule {}