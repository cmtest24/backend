import { Injectable, NotFoundException, ConflictException, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Cache } from 'cache-manager';
import { Post } from './entities/post.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private postsRepository: Repository<Post>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private configService: ConfigService,
  ) {}

  async create(createPostDto: CreatePostDto): Promise<Post> {
    try {
      // Check if slug already exists
      const existingPost = await this.postsRepository.findOne({
        where: { slug: createPostDto.slug },
      });

      if (existingPost) {
        throw new ConflictException('Post with this slug already exists');
      }

      // Set publishedAt if the post is published
      let publishedAt = null;
      if (createPostDto.isPublished === true || createPostDto.isPublished === undefined) {
        publishedAt = new Date();
      }

      const post = this.postsRepository.create({
        ...createPostDto,
        publishedAt,
      });
      
      const savedPost = await this.postsRepository.save(post);
      
      // Clear cache after creating a new post
      await this.clearCache();
      
      return savedPost;
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw error;
    }
  }

  async findAll(search?: string, tag?: string, limit = 10, page = 1): Promise<{ posts: Post[]; total: number }> {
    const cacheKey = `posts_${search || ''}_${tag || ''}_${limit}_${page}`;
    
    // Try to get from cache first
    const cachedResult = await this.cacheManager.get(cacheKey);
    if (cachedResult) {
      // Prepend URL to cached results before returning
      const baseUrl = this.configService.get<string>('DOMAIN');
      const result = cachedResult as { posts: Post[]; total: number };
      result.posts.forEach(post => {
        if (post.imageUrl && !post.imageUrl.startsWith('http')) {
          post.imageUrl = `${baseUrl}${post.imageUrl}`;
        }
      });
      return result;
    }
    
    const skip = (page - 1) * limit;
    
    const where: any = { isPublished: true };
    
    // Apply filters if provided
    if (search) {
      where.title = Like(`%${search}%`);
    }
    
    if (tag) {
      // Simplified approach for array searching
      where.tags = Like(`%${tag}%`);
    }
    
    const [posts, total] = await this.postsRepository.findAndCount({
      where,
      order: { publishedAt: 'DESC' },
      skip,
      take: limit,
    });
    
    // Prepend URL to fetched posts
    const baseUrl = this.configService.get<string>('DOMAIN');
    posts.forEach(post => {
      if (post.imageUrl && !post.imageUrl.startsWith('http')) {
        post.imageUrl = `${baseUrl}${post.imageUrl}`;
      }
    });

    const result = { posts, total };

    // Cache the result (cache the modified result)
    await this.cacheManager.set(cacheKey, result, 1800); // Cache for 30 minutes

    return result;
  }

  async findAllAdmin(): Promise<Post[]> {
    const posts = await this.postsRepository.find({
      order: { createdAt: 'DESC' },
    });

    // Prepend URL to fetched posts
    const baseUrl = this.configService.get<string>('DOMAIN');
    posts.forEach(post => {
      if (post.imageUrl && !post.imageUrl.startsWith('http')) {
        post.imageUrl = `${baseUrl}${post.imageUrl}`;
      }
    });

    return posts;
  }

  async findBySlug(slug: string): Promise<Post> {
    const cacheKey = `post_${slug}`;
    
    // Try to get from cache first
    const cachedPost = await this.cacheManager.get<Post>(cacheKey);
    if (cachedPost) {
      // Prepend URL to cached post before returning
      const baseUrl = this.configService.get<string>('DOMAIN');
      if (cachedPost.imageUrl && !cachedPost.imageUrl.startsWith('http')) {
        cachedPost.imageUrl = `${baseUrl}${cachedPost.imageUrl}`;
      }
      return cachedPost;
    }
    
    const post = await this.postsRepository.findOne({
      where: { slug, isPublished: true },
    });

    if (!post) {
      throw new NotFoundException(`Post with slug ${slug} not found`);
    }
    
    // Increment view count
    post.viewCount += 1;
    await this.postsRepository.save(post);
    
    // Prepend URL to fetched post
    const baseUrl = this.configService.get<string>('DOMAIN');
    if (post.imageUrl && !post.imageUrl.startsWith('http')) {
      post.imageUrl = `${baseUrl}${post.imageUrl}`;
    }

    // Cache the post (cache the modified post)
    await this.cacheManager.set(cacheKey, post, 3600); // Cache for 1 hour

    return post;
  }

  async findOne(id: string): Promise<Post> {
    const post = await this.postsRepository.findOne({
      where: { id },
    });

    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    // Prepend URL to fetched post
    const baseUrl = this.configService.get<string>('DOMAIN');
    if (post.imageUrl && !post.imageUrl.startsWith('http')) {
      post.imageUrl = `${baseUrl}${post.imageUrl}`;
    }

    return post;
  }

  async update(id: string, updatePostDto: UpdatePostDto): Promise<Post> {
    const post = await this.findOne(id);
    
    // Check slug uniqueness if changing
    if (updatePostDto.slug && updatePostDto.slug !== post.slug) {
      const existingPost = await this.postsRepository.findOne({
        where: { slug: updatePostDto.slug },
      });

      if (existingPost) {
        throw new ConflictException('Post with this slug already exists');
      }
    }
    
    // Update publishedAt if publishing for the first time
    if (updatePostDto.isPublished === true && !post.isPublished) {
      post.publishedAt = new Date();
    }
    
    // Update the post
    Object.assign(post, updatePostDto);
    
    const updatedPost = await this.postsRepository.save(post);
    
    // Clear cache
    await this.clearCache();
    if (post.slug) {
      await this.cacheManager.del(`post_${post.slug}`);
    }
    if (updatePostDto.slug) {
      await this.cacheManager.del(`post_${updatePostDto.slug}`);
    }
    
    return updatedPost;
  }

  async remove(id: string): Promise<void> {
    const post = await this.findOne(id);
    
    await this.postsRepository.remove(post);
    
    // Clear cache
    await this.clearCache();
    if (post.slug) {
      await this.cacheManager.del(`post_${post.slug}`);
    }
  }
  
  private async clearCache(): Promise<void> {
    // Clear all posts-related cache
    const store: any = (this.cacheManager as any).store;
    // Check if store and store.keys exist before calling keys()
    if (store && typeof store.keys === 'function') {
      const keys = await store.keys('posts_*');
      await Promise.all(keys.map(key => this.cacheManager.del(key)));
    } else {
      // Log a warning or handle the case where keys() is not available
      console.warn('Cache store does not support keys() method or store is undefined.');
      // Depending on the cache store, you might need a different approach to clear cache by pattern
      // For example, if using cache-manager-redis-store, you might need to access the redis client directly
    }
  }
}
