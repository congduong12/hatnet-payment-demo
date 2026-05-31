export type Plan = 'FREE' | 'PRO';

export type InternalUser = {
  id: string;
  externalAuthProvider: 'clerk';
  externalAuthUserId: string;
  email?: string;
  name?: string;
  avatarUrl?: string;
  currentPlan: Plan;
  createdAt: string;
  updatedAt: string;
};
