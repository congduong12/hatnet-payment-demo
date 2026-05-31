import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { AuthenticatedRequest, VerifiedAuth } from './auth.types.js';

export const CurrentAuth = createParamDecorator(
  (_data: unknown, context: ExecutionContext): VerifiedAuth => {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    return request.auth;
  },
);
