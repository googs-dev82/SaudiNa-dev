import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type {
  CurrentUserContext,
  RequestWithContext,
} from '../types/request-context.type.js';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): CurrentUserContext | undefined => {
    const request = ctx.switchToHttp().getRequest<RequestWithContext>();
    return request.user;
  },
);
