import {
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/constants/role.enum';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';

@ApiTags('upload-images')
@Controller('upload-images')
export class UploadImagesController {
  /**
   * Upload nhiều ảnh, lưu vào public/products, trả về URL
   */
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @UseInterceptors(
    FilesInterceptor('images', undefined, {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadPath = 'backend/public/products';
          if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
          }
          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, uniqueSuffix + extname(file.originalname));
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
          return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
      },
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB/file
    })
  )
  @ApiOperation({ summary: 'Upload nhiều ảnh (admin only)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        images: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
          description: 'Chọn nhiều file ảnh'
        }
      }
    }
  })
  @ApiBearerAuth()
  @ApiResponse({ status: 201, description: 'Images uploaded successfully' })
  async uploadImages(
    @UploadedFiles() files: Array<Express.Multer.File>,
  ): Promise<{ imageUrls: string[] }> {
    if (!files || files.length === 0) {
      return { imageUrls: [] };
    }
    const urls = files.map(
      (file) =>
        `/public/products/${file.filename}`,
    );
    return { imageUrls: urls };
  }
}