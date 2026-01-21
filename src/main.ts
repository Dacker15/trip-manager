import { ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  const configService = app.get(ConfigService)

  // CORS Configuration
  const corsOrigin = configService.get<string>('CORS_ORIGIN', '*')
  app.enableCors({
    origin: corsOrigin,
    methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  })

  // Validation Pipe Configuration
  app.useGlobalPipes(new ValidationPipe({ transform: true }))

  // Swagger Configuration
  const config = new DocumentBuilder().setTitle('Trip Manager').build()
  const documentFactory = () => SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('docs', app, documentFactory)

  await app.listen(process.env.PORT ?? 3000)
}

void bootstrap()
