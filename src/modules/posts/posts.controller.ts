import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  UseGuards,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/constants/role.enum';
import { CacheInterceptor } from '../../common/interceptors/cache.interceptor';

@ApiTags('posts')
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Create a new blog post (admin only)' })
  @ApiResponse({ status: 201, description: 'Post created successfully' })
  @ApiResponse({ status: 409, description: 'Post with this slug already exists' })
  @ApiBearerAuth()
  create(@Body() createPostDto: CreatePostDto) {
    return this.postsService.create(createPostDto);
  }

  @Get()
  @UseInterceptors(CacheInterceptor)
  @ApiOperation({ summary: 'Get all published blog posts' })
  @ApiResponse({ status: 200, description: 'Return published posts' })
  @ApiQuery({ name: 'search', required: false, description: 'Search term' })
  @ApiQuery({ name: 'tag', required: false, description: 'Filter by tag' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of posts per page' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  findAll(
    @Query('search') search?: string,
    @Query('tag') tag?: string,
    @Query('limit') limit?: number,
    @Query('page') page?: number,
  ) {
    return this.postsService.findAll(search, tag, limit, page);
  }

  @Get(':slug')
  @UseInterceptors(CacheInterceptor)
  @ApiOperation({ summary: 'Get a blog post by slug' })
  @ApiResponse({ status: 200, description: 'Return the post' })
  @ApiResponse({ status: 404, description: 'Post not found' })
  findBySlug(@Param('slug') slug: string) {
    return this.postsService.findBySlug(slug);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update a blog post (admin only)' })
  @ApiResponse({ status: 200, description: 'Post updated successfully' })
  @ApiResponse({ status: 404, description: 'Post not found' })
  @ApiResponse({ status: 409, description: 'Post with this slug already exists' })
  @ApiBearerAuth()
  update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto) {
    return this.postsService.update(id, updatePostDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete a blog post (admin only)' })
  @ApiResponse({ status: 200, description: 'Post deleted successfully' })
  @ApiResponse({ status: 404, description: 'Post not found' })
  @ApiBearerAuth()
  remove(@Param('id') id: string) {
    return this.postsService.remove(id);
  }
}
