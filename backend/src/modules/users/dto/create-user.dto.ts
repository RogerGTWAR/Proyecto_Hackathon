import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

import {
  IdentificationType,
  UserRole,
} from '../entities/user.entity';

export class CreateUserDto {
  @IsEmail({}, { message: 'El email no tiene un formato válido' })
  @MaxLength(255)
  email!: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string;

  @IsOptional()
  @IsEnum(IdentificationType, {
    message: 'El tipo de identificación no es válido',
  })
  identificationType?: IdentificationType;

  @IsString()
  @IsNotEmpty({ message: 'La identificación es obligatoria' })
  @MaxLength(50)
  @Matches(/^[A-Za-z0-9-]+$/, {
    message: 'La identificación solo puede contener letras, números y guiones',
  })
  identificationNumber!: string;

  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener mínimo 6 caracteres' })
  @MaxLength(255)
  password!: string;

  @IsOptional()
  @IsArray({ message: 'roles debe ser un arreglo' })
  @ArrayNotEmpty({ message: 'Debe tener al menos un rol' })
  @IsEnum(UserRole, {
    each: true,
    message: 'Los roles válidos son admin, client o worker',
  })
  roles?: UserRole[];

  @IsString()
  @MaxLength(150)
  fullName!: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  profileImage?: string;

  @IsOptional()
  @IsBoolean()
  isVerified?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}