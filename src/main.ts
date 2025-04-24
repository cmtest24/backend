import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as fs from 'fs';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Global prefix
  app.setGlobalPrefix('api');
  
  // Enable CORS
  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
  });

  // Serve static files
  app.useStaticAssets(join(__dirname, '..', 'public'), {
    prefix: '/public',
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Đông Y Pharmacy API')
    .setDescription('The Đông Y Pharmacy REST API documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Ghi file swagger.json để import vào Postman
  fs.writeFileSync('./swagger.json', JSON.stringify(document, null, 2));

  // Start the server
  const port = process.env.PORT || 5000;
  await app.listen(port, '0.0.0.0');
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
