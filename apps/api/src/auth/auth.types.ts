import type { Request } from 'express';

export type VerifiedAuth = {
  externalAuthProvider: 'clerk';
  externalAuthUserId: string;
  sessionId?: string;
  email?: string;
  name?: string;
  avatarUrl?: string;
};

export type AuthenticatedRequest = Request & {
  auth: VerifiedAuth;
};
