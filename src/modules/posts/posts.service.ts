import { 
  Injectable, 
  NotFoundException, 
  BadRequestException,
  Inject,
  CACHE_MANAGER
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Cache } from 'cache-manager';
import * as slugify from 'slugify';
import { Post, PostStatus } from './entities/post.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PaginationOptions, PaginatedResult } from '../../common/interfaces/pagination.interface';
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '../../common/constants';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private postsRepository: Repository<Post>,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
  ) {}

  async findPublishedPosts(
    options: PaginationOptions,
    tag?: string
  ): Promise<PaginatedResult<Post>> {
    const page = options.page || 1;
    const limit = Math.min(options.limit || DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);
    const sortBy = options.sortBy || 'publishedAt';
    const order = options.order || 'DESC';
    
    // Build query conditions
    const whereConditions: any = { status: PostStatus.PUBLISHED };
    
    // Query builder for tag filtering
    const queryBuilder = this.postsRepository.createQueryBuilder('post')
      .where('post.status = :status', { status: PostStatus.PUBLISHED })
      .leftJoinAndSelect('post.author', 'author')
      .orderBy(`post.${sortBy}`, order === 'ASC' ? 'ASC' : 'DESC')
      .take(limit)
      .skip((page - 1) * limit);
    
    if (tag) {
      queryBuilder.andWhere('post.tags LIKE :tag', { tag: `%${tag}%` });
    }
    
    const [posts, total] = await queryBuilder.getManyAndCount();
    
    const totalPages = Math.ceil(total / limit);
    
    return {
      data: posts,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  async findAllAdmin(
    options: PaginationOptions,
    status?: string
  ): Promise<PaginatedResult<Post>> {
    const page = options.page || 1;
    const limit = Math.min(options.limit || DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);
    const sortBy = options.sortBy || 'createdAt';
    const order = options.order || 'DESC';
    
    // Build query conditions
    const whereConditions: any = {};
    
    if (status) {
      whereConditions.status = status;
    }
    
    const [posts, total] = await this.postsRepository.findAndCount({
      where: whereConditions,
      order: { [sortBy]: order },
      take: limit,
      skip: (page - 1) * limit,
      relations: ['author'],
    });
    
    const totalPages = Math.ceil(total / limit);
    
    return {
      data: posts,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  async findBySlug(slug: string): Promise<Post> {
    const post = await this.postsRepository.findOne({
      where: { slug, status: PostStatus.PUBLISHED },
      relations: ['author'],
    });
    
    if (!post) {
      throw new NotFoundException(`Post with slug "${slug}" not found`);
    }
    
    return post;
  }

  async findOne(id: number): Promise<Post> {
    const post = await this.postsRepository.findOne({
      where: { id },
      relations: ['author'],
    });
    
    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }
    
    return post;
  }

  async create(createPostDto: CreatePostDto): Promise<Post> {
    const { title, status } = createPostDto;
    
    // Generate slug from title
    const slug = this.generateSlug(title);
    
    // Check if slug is unique
    const existingPost = await this.postsRepository.findOne({
      where: { slug },
    });
    
    if (existingPost) {
      throw new BadRequestException('Post with similar title already exists');
    }
    
    // Set publishedAt if status is PUBLISHED
    const publishedAt = status === PostStatus.PUBLISHED ? new Date() : null;
    
    // Create post
    const post = this.postsRepository.create({
      ...createPostDto,
      slug,
      publishedAt,
      authorId: 1, // Default to admin for now, should be taken from authenticated user
    });
    
    const savedPost = await this.postsRepository.save(post);
    
    // Clear cache
    await this.clearPostsCache();
    
    return savedPost;
  }

  async update(id: number, updatePostDto: UpdatePostDto): Promise<Post> {
    const post = await this.findOne(id);
    
    // If updating title, update slug
    if (updatePostDto.title) {
      const newSlug = this.generateSlug(updatePostDto.title);
      
      // Check if new slug is unique (excluding current post)
      const existingPost = await this.postsRepository.findOne({
        where: { slug: newSlug },
      });
      
      if (existingPost && existingPost.id !== id) {
        throw new BadRequestException('Post with similar title already exists');
      }
      
      post.slug = newSlug;
    }
    
    // If changing status to published and not already published, set publishedAt
    if (updatePostDto.status === PostStatus.PUBLISHED && post.status !== PostStatus.PUBLISHED) {
      post.publishedAt = new Date();
    }
    
    // Update post
    const updatedPost = await this.postsRepository.save({
      ...post,
      ...updatePostDto,
    });
    
    // Clear cache
    await this.clearPostsCache();
    
    return updatedPost;
  }

  async remove(id: number): Promise<{ message: string }> {
    const post = await this.findOne(id);
    
    await this.postsRepository.remove(post);
    
    // Clear cache
    await this.clearPostsCache();
    
    return { message: `Post with ID ${id} has been deleted` };
  }
  
  private generateSlug(title: string): string {
    return slugify(title, {
      lower: true,
      strict: true,
      locale: 'vi',
    });
  }

  private async clearPostsCache(): Promise<void> {
    // Clear cache keys related to posts
    // This is a simplified approach, in a real-world scenario, 
    // you might want to be more specific about which cache keys to clear
    const keys = await this.cacheManager.keys('posts:*');
    for (const key of keys) {
      await this.cacheManager.del(key);
    }
  }
}
