import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Provider } from '../../providers/entities/provider.entity';

@Entity('provider_schedule')
export class ProviderSchedule {
  @PrimaryGeneratedColumn({ name: 'provider_schedule_id' })
  providerScheduleId!: number;

  @Column({
    name: 'provider_id',
    type: 'integer',
  })
  providerId!: number;

  @Column({
    type: 'varchar',
    length: 255,
  })
  day!: string;

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

  @DeleteDateColumn({
    name: 'deleted_at',
    type: 'timestamp',
    nullable: true,
  })
  deletedAt!: Date | null;

  @ManyToOne(() => Provider, {
    eager: true,
  })
  @JoinColumn({ name: 'provider_id' })
  provider!: Provider;
}