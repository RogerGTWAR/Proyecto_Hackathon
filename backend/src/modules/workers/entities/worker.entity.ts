import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { User } from '../../users/entities/user.entity';
import { WorkerSchedule } from '../../worker-schedule/entities/worker-schedule.entity';

export enum WorkerStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

@Entity('workers')
export class Worker {
  @PrimaryGeneratedColumn({ name: 'worker_id' })
  workerId!: number;

  @Index('idx_workers_user_id')
  @Column({
    name: 'user_id',
    type: 'integer',
    unique: true,
  })
  userId!: number;

  @Column({
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  description!: string | null;

  @Column({
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  experience!: string | null;

  @Column({
    name: 'average_rating',
    type: 'decimal',
    precision: 3,
    scale: 2,
    default: 0,
  })
  averageRating!: number;

  @Column({
    name: 'total_jobs',
    type: 'integer',
    default: 0,
  })
  totalJobs!: number;

  @Index('idx_workers_status')
  @Column({
    type: 'varchar',
    length: 50,
    default: WorkerStatus.ACTIVE,
  })
  status!: WorkerStatus;

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

  @Index('idx_workers_deleted_at')
  @DeleteDateColumn({
    name: 'deleted_at',
    type: 'timestamp',
    nullable: true,
  })
  deletedAt!: Date | null;

  @OneToOne(() => User, (user) => user.worker, {
    eager: true,
  })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @OneToMany(() => WorkerSchedule, (schedule) => schedule.worker)
  schedules!: WorkerSchedule[];
}