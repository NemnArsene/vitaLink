import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY, SCOPES_KEY, PERMISSIONS_KEY } from '../decorators/roles.decorator';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import type { Scope } from '../enums/roles.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const requiredScopes = this.reflector.getAllAndOverride<Scope[]>(SCOPES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('No user context found');
    }

    if (requiredScopes && requiredScopes.length > 0) {
      const hasScope = requiredScopes.includes(user.scope as Scope);
      if (!hasScope) {
        throw new ForbiddenException(
          `Insufficient scope. Required: ${requiredScopes.join(', ')}. Your scope: ${user.scope}`,
        );
      }
    }

    if (requiredRoles && requiredRoles.length > 0) {
      const hasRole = requiredRoles.includes(user.role);
      if (!hasRole) {
        throw new ForbiddenException(
          `Insufficient role. Required: ${requiredRoles.join(', ')}. Your role: ${user.role}`,
        );
      }
    }

    if (requiredPermissions && requiredPermissions.length > 0) {
      const userPermissions = user.permissions || [];
      const hasPermission = requiredPermissions.every((perm) => userPermissions.includes(perm));
      if (!hasPermission) {
        throw new ForbiddenException(
          `Insufficient permissions. Required: ${requiredPermissions.join(', ')}`,
        );
      }
    }

    return true;
  }
}
