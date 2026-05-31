import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from 'typeorm';
import type { Plan } from '../user.types.js';

@Entity({ name: 'users' })
@Unique('UQ_users_external_auth', ['externalAuthProvider', 'externalAuthUserId'])
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'external_auth_provider', type: 'varchar', length: 32 })
  externalAuthProvider!: 'clerk';

  @Column({ name: 'external_auth_user_id', type: 'varchar', length: 128 })
  externalAuthUserId!: string;

  @Column({ type: 'varchar', length: 320, nullable: true })
  email?: string | null;

  @Column({ type: 'varchar', length: 160, nullable: true })
  name?: string | null;

  @Column({ name: 'avatar_url', type: 'text', nullable: true })
  avatarUrl?: string | null;

  @Column({ name: 'current_plan', type: 'varchar', length: 32, default: 'FREE' })
  currentPlan!: Plan;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
