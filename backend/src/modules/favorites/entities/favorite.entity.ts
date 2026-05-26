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

import { User } from '../../users/entities/user.entity';
import { Provider } from '../../providers/entities/provider.entity';

@Entity('favorites')
export class Favorite {
  @PrimaryGeneratedColumn({ name: 'favorite_id' })
  favoriteId!: number;

  @Column({
    name: 'user_id',
    type: 'integer',
  })
  userId!: number;

  @Column({
    name: 'provider_id',
    type: 'integer',
  })
  providerId!: number;

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

  @ManyToOne(() => User, {
    eager: true,
  })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @ManyToOne(() => Provider, {
    eager: true,
  })
  @JoinColumn({ name: 'provider_id' })
  provider!: Provider;
}