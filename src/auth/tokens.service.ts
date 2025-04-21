import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class TokensService {
  constructor(
    private readonly configService: ConfigService,
    @Inject('JWT_ACCESS_SERVICE') private readonly accessJwtService: JwtService,
    @Inject('JWT_REFRESH_SERVICE')
    private readonly refreshJwtService: JwtService,
  ) {}

  generateAccessToken(userId: string, role: string): string {
    return this.accessJwtService.sign({ sub: userId, role });
  }

  generateRefreshToken(userId: string, role: string): string {
    return this.refreshJwtService.sign({ sub: userId, role });
  }
}
