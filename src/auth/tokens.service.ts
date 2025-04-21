import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Redis } from 'ioredis';

@Injectable()
export class TokensService {
  constructor(
    private readonly configService: ConfigService,
    @Inject('JWT_ACCESS_SERVICE') private readonly accessJwtService: JwtService,
    @Inject('JWT_REFRESH_SERVICE')
    private readonly refreshJwtService: JwtService,
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
  ) {}

  generateAccessToken(userId: string, role: string): string {
    return this.accessJwtService.sign({ sub: userId, role });
  }

  async generateRefreshToken(userId: string, role: string): Promise<string> {
    const refreshToken = this.refreshJwtService.sign({ sub: userId, role });
    await this.storeRefreshToken(userId, refreshToken);
    return refreshToken;
  }

  async storeRefreshToken(userId: string, token: string): Promise<void> {
    await this.redis.set(
      `refresh:${userId}`,
      token,
      'EX',
      this.configService.get<number>('JWT_REFRESH_TTL', 7 * 24 * 60 * 60),
    );
  }

  async validateRefreshToken(userId: string, token: string): Promise<boolean> {
    const stored = await this.redis.get(`refresh:${userId}`);
    return stored === token;
  }
}
