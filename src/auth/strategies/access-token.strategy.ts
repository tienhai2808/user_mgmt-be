import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Request } from 'express';

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(Strategy, 'access-token') {
  constructor(
    private configService: ConfigService,
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => req?.cookies?.accessToken,
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_ACCESS_SECRET'),
    });
  }

  async validate(payload: { sub: string, role: string }) {
    const user = await this.userRepository.findOne({ where: { id: payload.sub } });
    if (!user) {
      return null;
    }
    return user;
  }
}