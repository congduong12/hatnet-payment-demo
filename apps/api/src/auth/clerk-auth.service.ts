import { Injectable, UnauthorizedException } from '@nestjs/common';
import { verifyToken } from '@clerk/backend';
import { loadEnv } from '../env.js';
import type { VerifiedAuth } from './auth.types.js';

type ClerkSessionClaims = {
  sub?: string;
  sid?: string;
  email?: string;
  name?: string;
  picture?: string;
  image_url?: string;
  first_name?: string;
  last_name?: string;
  primary_email_address?: string;
};

@Injectable()
export class ClerkAuthService {
  async verifyBearerToken(authorizationHeader?: string): Promise<VerifiedAuth> {
    const token = this.extractBearerToken(authorizationHeader);
    const env = loadEnv();

    if (!env.CLERK_SECRET_KEY) {
      throw new UnauthorizedException('Clerk secret key is not configured');
    }

    try {
      const tokenResult = await verifyToken(token, {
        secretKey: env.CLERK_SECRET_KEY,
        authorizedParties: env.CLERK_AUTHORIZED_PARTIES,
      });
      const claims = tokenResult as ClerkSessionClaims;
      const externalAuthUserId = claims.sub;

      if (!externalAuthUserId) {
        throw new UnauthorizedException('Clerk token is missing subject');
      }

      return {
        externalAuthProvider: 'clerk',
        externalAuthUserId,
        sessionId: claims.sid,
        email: claims.email ?? claims.primary_email_address,
        name: this.resolveName(claims),
        avatarUrl: claims.picture ?? claims.image_url,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      throw new UnauthorizedException('Invalid Clerk session token');
    }
  }

  private extractBearerToken(authorizationHeader?: string): string {
    if (!authorizationHeader) {
      throw new UnauthorizedException('Missing Authorization header');
    }

    const [scheme, token] = authorizationHeader.split(' ');

    if (scheme !== 'Bearer' || !token) {
      throw new UnauthorizedException('Authorization header must be Bearer token');
    }

    return token;
  }

  private resolveName(claims: ClerkSessionClaims): string | undefined {
    if (claims.name) {
      return claims.name;
    }

    const name = [claims.first_name, claims.last_name].filter(Boolean).join(' ');
    return name || undefined;
  }
}
