import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: (configService: ConfigService) => {
        const redis = new Redis({
          host: configService.get<string>('REDIS_HOST', 'localhost'),
          port: configService.get<number>('REDIS_PORT', 6379),
          db: configService.get<number>('REDIS_DB', 0),
        });
        redis.on('connect', () =>
          console.log(
            `Redis connected att http://${configService.get<string>('REDIS_HOST')}:${configService.get<number>('REDIS_PORT')}`,
          ),
        );
        redis.on('error', (err) => console.error('Redis error:', err));
        redis.on('close', () => console.error('Redis connection closed'));
        return redis;
      },
      inject: [ConfigService],
    },
  ],
  exports: ['REDIS_CLIENT'],
})
export class RedisModule {}
