import {
  IdentificationType,
  UserRole,
} from '../entities/user.entity';

export class UserResponseDto {
  userId!: number;
  email!: string;
  phone!: string | null;
  identificationType!: IdentificationType;
  identificationNumber!: string;
  roles!: UserRole[];
  fullName!: string;
  profileImage!: string | null;
  isVerified!: boolean;
  isActive!: boolean;
  createdAt!: Date;
  updatedAt!: Date;
}