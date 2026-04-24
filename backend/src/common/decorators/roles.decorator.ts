import { SetMetadata } from '@nestjs/common';
import { ROLES_KEY } from '../constants/metadata.constants.js';
import type { RoleCode } from '../domain.constants.js';

export const Roles = (...roles: RoleCode[]): MethodDecorator & ClassDecorator =>
  SetMetadata(ROLES_KEY, roles);
