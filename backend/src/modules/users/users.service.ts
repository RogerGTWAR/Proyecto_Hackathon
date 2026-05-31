import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { IsNull, Repository } from 'typeorm';

import {
  IdentificationType,
  User,
  UserRole,
} from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const email = createUserDto.email.trim().toLowerCase();

    const identificationNumber = this.normalizeIdentification(
      createUserDto.identificationNumber,
    );

    const emailExists = await this.usersRepository.findOne({
      where: { email },
    });

    if (emailExists) {
      throw new ConflictException('El correo ya está registrado');
    }

    const identificationExists = await this.usersRepository.findOne({
      where: { identificationNumber },
    });

    if (identificationExists) {
      throw new ConflictException('La identificación ya está registrada');
    }

    const passwordHash = await bcrypt.hash(createUserDto.password, 10);

    const user = this.usersRepository.create({
      email,
      phone: createUserDto.phone ?? null,
      identificationType:
        createUserDto.identificationType ?? IdentificationType.CEDULA,
      identificationNumber,
      passwordHash,
      roles: createUserDto.roles ?? [UserRole.CLIENT],
      fullName: createUserDto.fullName.trim(),
      profileImage: createUserDto.profileImage ?? null,
      isVerified: createUserDto.isVerified ?? false,
      isActive: createUserDto.isActive ?? true,
    });

    const savedUser = await this.usersRepository.save(user);

    return this.toResponseDto(savedUser);
  }

  async findAll(currentUser: any): Promise<UserResponseDto[]> {
    this.validateAdmin(currentUser);

    const users = await this.usersRepository.find({
      where: {
        deletedAt: IsNull(),
      },
      order: {
        userId: 'ASC',
      },
    });

    return users.map((user) => this.toResponseDto(user));
  }

  async findDeleted(currentUser: any): Promise<UserResponseDto[]> {
    this.validateAdmin(currentUser);

    const users = await this.usersRepository
      .createQueryBuilder('user')
      .withDeleted()
      .where('user.deleted_at IS NOT NULL')
      .orderBy('user.user_id', 'ASC')
      .getMany();

    return users.map((user) => this.toResponseDto(user));
  }

  async findOne(
    userId: number,
    currentUser?: any,
  ): Promise<UserResponseDto> {
    const user = await this.findOneEntity(userId);

    if (currentUser) {
      this.validateUserOwner(user.userId, currentUser);
    }

    return this.toResponseDto(user);
  }

  async findOneEntity(userId: number): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: {
        userId,
        deletedAt: IsNull(),
      },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return user;
  }

  async findEntityById(userId: number): Promise<User> {
    return this.findOneEntity(userId);
  }

  async findByEmailWithPassword(email: string): Promise<User | null> {
    return this.usersRepository
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .where('LOWER(user.email) = LOWER(:email)', { email })
      .andWhere('user.deleted_at IS NULL')
      .getOne();
  }

  async update(
    userId: number,
    updateUserDto: UpdateUserDto,
    currentUser?: any,
  ): Promise<UserResponseDto> {
    const user = await this.usersRepository
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .where('user.user_id = :userId', { userId })
      .andWhere('user.deleted_at IS NULL')
      .getOne();

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (currentUser) {
      this.validateUserOwner(user.userId, currentUser);
    }

    const isAdmin = currentUser ? this.isAdmin(currentUser) : true;

    if (updateUserDto.email !== undefined) {
      const newEmail = updateUserDto.email.trim().toLowerCase();

      const emailExists = await this.usersRepository.findOne({
        where: { email: newEmail },
      });

      if (emailExists && emailExists.userId !== userId) {
        throw new ConflictException('El correo ya está registrado');
      }

      user.email = newEmail;
    }

    if (updateUserDto.identificationNumber !== undefined) {
      const newIdentificationNumber = this.normalizeIdentification(
        updateUserDto.identificationNumber,
      );

      const identificationExists = await this.usersRepository.findOne({
        where: { identificationNumber: newIdentificationNumber },
      });

      if (
        identificationExists &&
        identificationExists.userId !== userId
      ) {
        throw new ConflictException('La identificación ya está registrada');
      }

      user.identificationNumber = newIdentificationNumber;
    }

    if (updateUserDto.identificationType !== undefined) {
      user.identificationType = updateUserDto.identificationType;
    }

    if (updateUserDto.phone !== undefined) {
      user.phone = updateUserDto.phone;
    }

    if (updateUserDto.password !== undefined) {
      user.passwordHash = await bcrypt.hash(updateUserDto.password, 10);
    }

    if (updateUserDto.fullName !== undefined) {
      user.fullName = updateUserDto.fullName.trim();
    }

    if (updateUserDto.profileImage !== undefined) {
      user.profileImage = updateUserDto.profileImage;
    }

    if (updateUserDto.roles !== undefined) {
      if (!isAdmin) {
        throw new ForbiddenException(
          'Solo un administrador puede cambiar los roles de un usuario',
        );
      }

      user.roles = updateUserDto.roles;
    }

    if (updateUserDto.isVerified !== undefined) {
      if (!isAdmin) {
        throw new ForbiddenException(
          'Solo un administrador puede verificar usuarios',
        );
      }

      user.isVerified = updateUserDto.isVerified;
    }

    if (updateUserDto.isActive !== undefined) {
      if (!isAdmin) {
        throw new ForbiddenException(
          'Solo un administrador puede cambiar el estado del usuario',
        );
      }

      user.isActive = updateUserDto.isActive;
    }

    const updatedUser = await this.usersRepository.save(user);

    return this.toResponseDto(updatedUser);
  }

  async softDelete(
    userId: number,
    currentUser?: any,
  ): Promise<{ message: string }> {
    const user = await this.findOneEntity(userId);

    if (currentUser) {
      this.validateUserOwner(user.userId, currentUser);
    }

    user.isActive = false;
    await this.usersRepository.save(user);

    await this.usersRepository.softDelete(userId);

    return {
      message: 'Usuario eliminado correctamente',
    };
  }

  async restore(
    userId: number,
    currentUser: any,
  ): Promise<UserResponseDto> {
    this.validateAdmin(currentUser);

    const user = await this.usersRepository.findOne({
      where: {
        userId,
      },
      withDeleted: true,
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (!user.deletedAt) {
      return this.toResponseDto(user);
    }

    await this.usersRepository.restore(userId);

    user.isActive = true;
    user.deletedAt = null;

    const restoredUser = await this.usersRepository.save(user);

    return this.toResponseDto(restoredUser);
  }

  async validatePassword(
    email: string,
    password: string,
  ): Promise<User | null> {
    const user = await this.findByEmailWithPassword(email);

    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      user.passwordHash,
    );

    return isPasswordValid ? user : null;
  }

  private normalizeIdentification(identificationNumber: string): string {
    return identificationNumber.trim().toUpperCase().replace(/\s+/g, '');
  }

  private isAdmin(currentUser: any): boolean {
    return currentUser?.roles?.includes(UserRole.ADMIN);
  }

  private validateAdmin(currentUser: any): void {
    if (!this.isAdmin(currentUser)) {
      throw new ForbiddenException(
        'Solo un administrador puede realizar esta acción',
      );
    }
  }

  private validateUserOwner(userId: number, currentUser: any): void {
    if (this.isAdmin(currentUser)) {
      return;
    }

    if (userId !== currentUser.userId) {
      throw new ForbiddenException(
        'No puedes acceder o modificar una cuenta que no es tuya',
      );
    }
  }

  private toResponseDto(user: User): UserResponseDto {
    return {
      userId: user.userId,
      email: user.email,
      phone: user.phone,
      identificationType: user.identificationType,
      identificationNumber: user.identificationNumber,
      roles: user.roles,
      fullName: user.fullName,
      profileImage: user.profileImage,
      isVerified: user.isVerified,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}