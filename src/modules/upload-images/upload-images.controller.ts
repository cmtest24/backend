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
import * as path from 'path';
import * as fs from 'fs';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/constants/role.enum';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import * as sharp from 'sharp';

@ApiTags('upload-images')
@Controller('upload-images')
export class UploadImagesController {
  /**
   * Upload nhiều ảnh, lưu vào public/products, trả về URL
   */
  @Post()
  @UseInterceptors(
    FilesInterceptor('images', undefined, {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const tempUploadPath = 'temp_uploads/'; // Thư mục tạm
          if (!fs.existsSync(tempUploadPath)) {
            fs.mkdirSync(tempUploadPath, { recursive: true });
          }
          cb(null, tempUploadPath);
        },
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, uniqueSuffix + path.extname(file.originalname));
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
  @ApiOperation({ summary: 'Upload nhiều ảnh' })
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
  @ApiResponse({ status: 201, description: 'Images uploaded successfully' })
  async uploadImages(
    @UploadedFiles() files: Array<Express.Multer.File>,
  ): Promise<{ imageUrls: string[] }> {
    if (!files || files.length === 0) {
      return { imageUrls: [] };
    }

    const urls: string[] = [];
    const uploadPath = 'public/';
    const tempUploadPath = 'temp_uploads/';
    const domain = process.env.DOMAIN || 'http://127.0.0.1:5000';

    // Ensure final upload directory exists
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    for (const file of files) {
      const tempFilePath = file.path; // Đường dẫn file tạm do Multer lưu
      try {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const newFilename = `${uniqueSuffix}.webp`;
        const finalFilePath = path.join(uploadPath, newFilename);

        // Read temporary file, convert to WebP, and save to final location
        await sharp(tempFilePath)
          .webp({ quality: 80 }) // Adjust quality as needed
          .toFile(finalFilePath);

        urls.push(`${domain}/${uploadPath}${newFilename}`.replace(/([^:]\/)\/+/g, '$1/'));
        // Đảm bảo không bị trùng dấu /

      } catch (error) {
        console.error(`Failed to process file ${file.originalname}:`, error);
        // Optionally handle the error
      } finally {
        // Xóa file tạm sau khi xử lý
        if (fs.existsSync(tempFilePath)) {
          fs.unlinkSync(tempFilePath);
        }
      }
    }

    // Xóa thư mục tạm nếu rỗng
    if (fs.existsSync(tempUploadPath) && fs.readdirSync(tempUploadPath).length === 0) {
        fs.rmdirSync(tempUploadPath);
    }


    return { imageUrls: urls };
  }
}