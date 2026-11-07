import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiExtension, ApiForbiddenResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Role } from '../../domain/enums/role.enum.js';
import { ROLES_KEY, RolesGuard } from '../guards/roles.guard.js';

export function Auth(...roles: Role[]): MethodDecorator & ClassDecorator {
  return applyDecorators(
    SetMetadata(ROLES_KEY, roles),
    UseGuards(AuthGuard('jwt'), RolesGuard),
    ApiBearerAuth(),
    ApiExtension('x-roles', roles.map((role) => role.toString())),
    ApiUnauthorizedResponse({
      description: 'No autenticado: token JWT ausente o inválido',
    }),
    ApiForbiddenResponse({
      description:
        roles.length > 0
          ? `Acceso denegado: se requiere rol ${roles.join(', ')}`
          : 'Acceso denegado: permisos insuficientes',
    }),
  );
}