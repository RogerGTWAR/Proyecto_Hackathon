import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Worker } from '../../workers/entities/worker.entity';

@Entity('worker_schedule')
export class WorkerSchedule {
  @PrimaryGeneratedColumn({ name: 'schedule_id' })
  scheduleId!: number;

  @Index('idx_worker_schedule_worker_id')
  @Column({
    name: 'worker_id',
    type: 'integer',
  })
  workerId!: number;

  @Index('idx_worker_schedule_day_of_week')
  @Column({
    name: 'day_of_week',
    type: 'varchar',
    length: 20,
  })
  dayOfWeek!: string;

  @Column({
    name: 'start_time',
    type: 'time',
  })
  startTime!: string;

  @Column({
    name: 'end_time',
    type: 'time',
  })
  endTime!: string;

  @Column({
    name: 'is_active',
    type: 'boolean',
    default: true,
  })
  isActive!: boolean;

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

  @Index('idx_worker_schedule_deleted_at')
  @DeleteDateColumn({
    name: 'deleted_at',
    type: 'timestamp',
    nullable: true,
  })
  deletedAt!: Date | null;

  @ManyToOne(() => Worker, (worker) => worker.schedules, {
    eager: true,
  })
  @JoinColumn({ name: 'worker_id' })
  worker!: Worker;
}