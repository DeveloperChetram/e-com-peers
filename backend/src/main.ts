import * as dotenv from 'dotenv';
dotenv.config();
import { NestFactory } from '@nestjs/core';
import { AppModule, ObserveInstrument } from './app.module.js';

import cookieParser from 'cookie-parser';

import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

const allowedOrigins = [
  'https://e-com-peers.vercel.app',
  'http://localhost:3000',
  'http://localhost:3001',
];


async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    instrument: ObserveInstrument,
  });
  app.setGlobalPrefix('api');
  app.enableCors({ credentials: true, origin: allowedOrigins});
  app.use(cookieParser());
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads/',
  });
  // await app.listen(process.env.PORT ?? 3000);
 await app.listen(4000, '0.0.0.0');
}
bootstrap();
