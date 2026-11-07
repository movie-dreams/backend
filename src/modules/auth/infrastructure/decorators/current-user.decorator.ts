import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtPayload } from '../../domain/interfaces/jwt-payload.interface.js';

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): JwtPayload | undefined => {
    const request = context.switchToHttp().getRequest();
    return request.user;
  },
);