import { ConfigService } from '@nestjs/config';

export const accessTokenConfig = (configService: ConfigService) => ({
  secret: configService.get<string>('JWT_ACCESS_SECRET'),
  signOptions: {
    expiresIn: configService.get<string>('JWT_ACCESS_EXPIRES_IN', '15m'),
  },
});

export const refreshTokenConfig = (configService: ConfigService) => ({
  secret: configService.get<string>('JWT_REFRESH_SECRET'),
  signOptions: {
    expiresIn: configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d'),
  },
});
