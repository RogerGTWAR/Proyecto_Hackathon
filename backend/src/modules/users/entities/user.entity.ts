import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Worker } from '../../workers/entities/worker.entity';

export enum IdentificationType {
  CEDULA = 'cedula',
  PASAPORTE = 'pasaporte',
  RUC = 'ruc',
  OTRO = 'otro',
}

export enum UserRole {
  ADMIN = 'admin',
  CLIENT = 'client',
  WORKER = 'worker',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn({ name: 'user_id' })
  userId!: number;

  @Index('idx_users_email')
  @Column({
    type: 'varchar',
    length: 255,
    unique: true,
  })
  email!: string;

  @Column({
    type: 'varchar',
    length: 30,
    nullable: true,
  })
  phone!: string | null;

  @Column({
    name: 'identification_type',
    type: 'varchar',
    length: 50,
    default: IdentificationType.CEDULA,
  })
  identificationType!: IdentificationType;

  @Index('idx_users_identification_number')
  @Column({
    name: 'identification_number',
    type: 'varchar',
    length: 50,
    unique: true,
  })
  identificationNumber!: string;

  @Column({
    name: 'password_hash',
    type: 'varchar',
    length: 255,
    select: false,
  })
  passwordHash!: string;

  @Index('idx_users_roles')
  @Column({
    name: 'roles',
    type: 'enum',
    enum: UserRole,
    enumName: 'user_role_enum',
    array: true,
    default: [UserRole.CLIENT],
  })
  roles!: UserRole[];

  @Column({
    name: 'full_name',
    type: 'varchar',
    length: 150,
  })
  fullName!: string;

  @Column({
    name: 'profile_image',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  profileImage!: string | null;

  @Column({
    name: 'is_verified',
    type: 'boolean',
    default: false,
  })
  isVerified!: boolean;

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

  @DeleteDateColumn({
    name: 'deleted_at',
    type: 'timestamp',
    nullable: true,
  })
  deletedAt!: Date | null;

  @OneToOne(() => Worker, (worker) => worker.user)
  worker!: Worker;
}