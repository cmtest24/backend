import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-store';
import { JwtModule } from '@nestjs/jwt';

import { databaseConfig } from './config/database.config';
import { redisConfig } from './config/redis.config';
import { jwtConfig } from './config/jwt.config';

import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { AddressesModule } from './modules/addresses/addresses.module';
import { WishlistModule } from './modules/wishlist/wishlist.module';
import { ProductsModule } from './modules/products/products.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { CartModule } from './modules/cart/cart.module';
import { OrdersModule } from './modules/orders/orders.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { PostsModule } from './modules/posts/posts.module';
import { ContactModule } from './modules/contact/contact.module';
import { PromotionsModule } from './modules/promotions/promotions.module';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';
import { UploadImagesModule } from './modules/upload-images/upload-images.module';
import { BannersModule } from './modules/banners/banners.module';
import { StoreInfoModule } from './modules/store-info/store-info.module';
import { VideosModule } from './modules/videos/videos.module';
import { ServiceModule } from './modules/service/service.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, redisConfig, jwtConfig],
    }),
    
    // Database
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('database.host'),
        port: configService.get('database.port'),
        username: configService.get('database.username'),
        password: configService.get('database.password'),
        database: configService.get('database.database'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true, // set to false in production
        logging: true,
      }),
    }),
    
    // In-memory Cache for development
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        ttl: configService.get('redis.ttl') || 300, // 5 minutes default
        max: 100, // Maximum number of items in cache
      }),
    }),
    
    // JWT
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('jwt.secret'),
        signOptions: {
          expiresIn: configService.get('jwt.expiresIn'),
        },
      }),
    }),
    
    // Feature modules
    AuthModule,
    UsersModule,
    AddressesModule,
    WishlistModule,
    ProductsModule,
    CategoriesModule,
    CartModule,
    OrdersModule,
    PaymentsModule,
    ReviewsModule,
    PostsModule,
    ContactModule,
    PromotionsModule,
    SubscriptionsModule,
  UploadImagesModule,
  BannersModule,
  StoreInfoModule,
  VideosModule,
  ServiceModule,
  ],
})
export class AppModule {}
