import { SetMetadata } from '@nestjs/common';
import { Scope } from '../enums/roles.enum';

export const ROLES_KEY = 'roles';
export const SCOPES_KEY = 'scopes';
export const PERMISSIONS_KEY = 'permissions';

export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
export const Scopes = (...scopes: Scope[]) => SetMetadata(SCOPES_KEY, scopes);
export const Permissions = (...permissions: string[]) => SetMetadata(PERMISSIONS_KEY, permissions);
