import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { ConfigService } from '@nestjs/config';

export const getCorsOptions = (configService: ConfigService): CorsOptions => {
  const allowedOrigins = configService
    .get<string>('CORS_ORIGINS')
    ?.split(',') || ['http://localhost:3000'];

  return {
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Không được phép truy cập'));
      }
    },
    credentials: true,
    methods: 'GET',
    allowedHeaders: 'Content-Type, Authorization',
    exposedHeaders: 'Content-Disposition',
  };
};