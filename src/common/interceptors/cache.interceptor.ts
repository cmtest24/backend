import {
  Injectable,
  ExecutionContext,
  CallHandler,
  NestInterceptor,
  Inject
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Cache } from 'cache-manager';

@Injectable()
export class CacheInterceptor implements NestInterceptor {
  private readonly ttl = 300; // 5 minutes default
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const cacheKey = `${request.method}-${request.url}`;
    
    // Try to get the result from cache
    const cachedData = await this.cacheManager.get(cacheKey);
    if (cachedData) {
      return of(cachedData);
    }
    
    // If not in cache, call the handler and cache the result
    return next.handle().pipe(
      tap(async (data) => {
        await this.cacheManager.set(cacheKey, data, this.ttl);
      }),
    );
  }
}
