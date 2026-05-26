import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { User } from '../../users/entities/user.entity';

@Entity('providers')
export class Provider {
  @PrimaryGeneratedColumn({ name: 'provider_id' })
  providerId!: number;

  @Column({
    name: 'user_id',
    type: 'integer',
    unique: true,
  })
  userId!: number;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  description!: string | null;

  @Column({
    type: 'varchar',
    length: 255,
    default: 'activo',
  })
  state!: string;

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

  @OneToOne(() => User, (user) => user.provider, {
    eager: true,
  })
  @JoinColumn({ name: 'user_id' })
  user!: User;
}