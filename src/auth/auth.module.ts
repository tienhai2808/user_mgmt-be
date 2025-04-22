import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Profile } from '../profiles/entities/profile.entity';
import { EmailService } from '../email/email.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { accessTokenConfig, refreshTokenConfig } from '../config/jwt.config';
import { AccessTokenStrategy } from './strategies/access-token.strategy';
import { RefreshTokenStrategy } from './strategies/refresh-token.strategy';
import { TokensService } from './tokens.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [TypeOrmModule.forFeature([User, Profile]), ConfigModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    EmailService,
    AccessTokenStrategy,
    RefreshTokenStrategy,
    TokensService,
    {
      provide: 'JWT_ACCESS_SERVICE',
      useFactory: (configService: ConfigService) =>
        new JwtService(accessTokenConfig(configService)),
      inject: [ConfigService],
    },
    {
      provide: 'JWT_REFRESH_SERVICE',
      useFactory: (configService: ConfigService) =>
        new JwtService(refreshTokenConfig(configService)),
      inject: [ConfigService],
    },
  ],
})
export class AuthModule {}
