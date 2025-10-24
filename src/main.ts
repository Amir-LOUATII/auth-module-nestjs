import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ✅ Enable CORS for Swagger OAuth2 (important)
  app.enableCors({
    origin: ['http://localhost:3000'], // or '*' during local dev
    credentials: true,
  });

  // ✅ Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Authentication Service')
    .setDescription('API documentation for Authentication Service')
    .setVersion('1.0')
    .addTag('auth')
    .addOAuth2({
      type: 'oauth2',
      flows: {
        authorizationCode: {
          authorizationUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
          tokenUrl: 'https://oauth2.googleapis.com/token',
          scopes: {
            email: 'Access to your email address',
            profile: 'Access to your basic profile info',
          },
        },
      },
    })
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // ✅ Correct Swagger setup with built-in redirect page
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      oauth2RedirectUrl: 'http://localhost:3000/api/oauth2-redirect.html',
    },
  });

  await app.listen(process.env.PORT ?? 3000);
  console.log(`🚀 Server running on http://localhost:3000`);
  console.log(`📘 Swagger UI available at http://localhost:3000/api`);
}

bootstrap();
