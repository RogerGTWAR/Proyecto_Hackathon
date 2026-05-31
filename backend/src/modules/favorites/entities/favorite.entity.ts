import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

import { User } from '../../users/entities/user.entity';
import { Worker } from '../../workers/entities/worker.entity';

@Entity('favorites')
@Unique('uq_favorites_user_worker', ['userId', 'workerId'])
export class Favorite {
  @PrimaryGeneratedColumn({ name: 'favorite_id' })
  favoriteId!: number;

  @Index('idx_favorites_user_id')
  @Column({
    name: 'user_id',
    type: 'integer',
  })
  userId!: number;

  @Index('idx_favorites_worker_id')
  @Column({
    name: 'worker_id',
    type: 'integer',
  })
  workerId!: number;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
  })
  createdAt!: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp',
  })
  updatedAt!: Date;

  @Index('idx_favorites_deleted_at')
  @DeleteDateColumn({
    name: 'deleted_at',
    type: 'timestamp',
    nullable: true,
  })
  deletedAt!: Date | null;

  @ManyToOne(() => User, {
    eager: true,
  })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @ManyToOne(() => Worker, {
    eager: true,
  })
  @JoinColumn({ name: 'worker_id' })
  worker!: Worker;
}