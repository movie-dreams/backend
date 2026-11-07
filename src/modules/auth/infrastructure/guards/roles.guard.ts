import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../../domain/enums/role.enum.js';
import { JwtPayload } from '../../domain/interfaces/jwt-payload.interface.js';

export const ROLES_KEY = 'auth:roles';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles?.length) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user: JwtPayload | undefined = request.user;

    if (!user?.roles?.length) {
      return false;
    }

    return requiredRoles.some((role) => user.roles.includes(role));
  }
}