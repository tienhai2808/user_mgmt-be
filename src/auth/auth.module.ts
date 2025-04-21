import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Profile } from '../profiles/entities/profile.entity';
import { EmailService } from '../email/email.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { accessTokenConfig, refreshTokenConfig } from '../config/jwt.config';
import { AccessTokenStrategy } from './strategies/access-token.strategy';
import { RefreshTokenStrategy } from './strategies/refresh-token.strategy';
import { TokensService } from './tokens.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Profile]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        accessTokenConfig(configService),
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        refreshTokenConfig(configService),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    EmailService,
    AccessTokenStrategy,
    RefreshTokenStrategy,
    TokensService,
    {
      provide: 'JWT_ACCESS_SERVICE',
      useFactory: (configService: ConfigService) => {
        return new JwtService(accessTokenConfig(configService));
      },
      inject: [ConfigService],
    },
    {
      provide: 'JWT_REFRESH_SERVICE',
      useFactory: (configService: ConfigService) => {
        return new JwtService(refreshTokenConfig(configService));
      },
      inject: [ConfigService],
    },
  ],
})
export class AuthModule {}
