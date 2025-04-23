import { Controller, Get, Post, Body, Put, Param, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { VideosService } from './videos.service';
import { CreateVideoDto } from './dto/create-video.dto';
import { UpdateVideoDto } from './dto/update-video.dto';
import { QueryVideoDto } from './dto/query-video.dto';
import { VideoDto } from './dto/video.dto';

@ApiTags('videos')
@Controller('videos')
export class VideosController {
  constructor(private readonly videosService: VideosService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new video' })
  @ApiResponse({ status: 201, description: 'Video created successfully', type: VideoDto })
  async create(@Body() createVideoDto: CreateVideoDto): Promise<VideoDto> {
    const video = await this.videosService.create(createVideoDto);
    // Assuming Video entity structure is compatible with VideoDto
    return video as VideoDto;
  }

  @Get()
  @ApiOperation({ summary: 'Get all videos with pagination and filtering' })
  @ApiResponse({ status: 200, description: 'Return videos with pagination info' })
  async findAll(@Query() query: QueryVideoDto): Promise<{ videos: VideoDto[]; total: number }> {
    const { videos, total } = await this.videosService.findAll(query);
    // Assuming Video entity structure is compatible with VideoDto
    return { videos: videos as VideoDto[], total };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a video by ID' })
  @ApiResponse({ status: 200, description: 'Return the video', type: VideoDto })
  @ApiResponse({ status: 404, description: 'Video not found' })
  async findOne(@Param('id') id: string): Promise<VideoDto> {
    const video = await this.videosService.findOne(id);
    // Assuming Video entity structure is compatible with VideoDto
    return video as VideoDto;
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a video by ID' })
  @ApiResponse({ status: 200, description: 'Video updated successfully', type: VideoDto })
  @ApiResponse({ status: 404, description: 'Video not found' })
  async update(@Param('id') id: string, @Body() updateVideoDto: UpdateVideoDto): Promise<VideoDto> {
    const video = await this.videosService.update(id, updateVideoDto);
    // Assuming Video entity structure is compatible with VideoDto
    return video as VideoDto;
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a video by ID' })
  @ApiResponse({ status: 200, description: 'Video deleted successfully' })
  @ApiResponse({ status: 404, description: 'Video not found' })
  async remove(@Param('id') id: string): Promise<void> {
    await this.videosService.remove(id);
  }
}