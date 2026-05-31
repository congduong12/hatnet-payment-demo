import { CanActivate, ExecutionContext, Inject, Injectable } from '@nestjs/common';
import type { Request } from 'express';
import { ClerkAuthService } from './clerk-auth.service.js';
import type { AuthenticatedRequest } from './auth.types.js';

@Injectable()
export class ClerkAuthGuard implements CanActivate {
  constructor(@Inject(ClerkAuthService) private readonly clerkAuthService: ClerkAuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest & Request>();
    request.auth = await this.clerkAuthService.verifyBearerToken(request.headers.authorization);

    return true;
  }
}
