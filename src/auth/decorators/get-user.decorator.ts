import { createParamDecorator, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { User } from '../../users/entities/user.entity'; 

export const GetUser = createParamDecorator(
  (data: keyof User | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new HttpException('Không được phép truy cập', HttpStatus.UNAUTHORIZED)
    }

    if (!data) {
      return user;
    }

    return user?.[data];
  },
);
