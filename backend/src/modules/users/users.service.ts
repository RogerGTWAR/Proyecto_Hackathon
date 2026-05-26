import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

const SALT_ROUNDS = 10;

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  private sanitizeUser(user: User) {
    const { password, ...safeUser } = user as any;
    return safeUser;
  }

  async create(createUserDto: CreateUserDto) {
    const email = createUserDto.email.trim().toLowerCase();

    const exists = await this.usersRepository.findOne({
      where: { email },
      withDeleted: true,
    });

    if (exists && exists.deletedAt === null) {
      throw new BadRequestException('El correo ya está registrado');
    }

    if (exists && exists.deletedAt !== null) {
      throw new BadRequestException(
        'Este correo pertenece a un usuario eliminado. Restaura el usuario o usa otro correo.',
      );
    }

    const hashedPassword = await bcrypt.hash(
      createUserDto.password,
      SALT_ROUNDS,
    );

    const user = this.usersRepository.create({
      email,
      number: createUserDto.number ?? null,
      password: hashedPassword,
      rol: createUserDto.rol,
      name: createUserDto.name,
      image: createUserDto.image ?? null,
      isVerified: createUserDto.isVerified ?? false,
      isActive: createUserDto.isActive ?? true,
    });

    const savedUser = await this.usersRepository.save(user);

    return {
      ok: true,
      msg: 'Usuario creado correctamente',
      user: this.sanitizeUser(savedUser),
    };
  }

  async findAll() {
    const users = await this.usersRepository.find({
      where: {
        deletedAt: IsNull(),
      },
      order: {
        userId: 'DESC',
      },
    });

    return {
      ok: true,
      users,
    };
  }

  async findOne(userId: number) {
    const user = await this.findOneEntity(userId);

    return {
      ok: true,
      user,
    };
  }

  async findOneEntity(userId: number) {
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

  async findByEmailWithPassword(email: string) {
    return this.usersRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('LOWER(user.email) = LOWER(:email)', { email })
      .andWhere('user.deleted_at IS NULL')
      .getOne();
  }

  async update(userId: number, updateUserDto: UpdateUserDto) {
    const user = await this.findOneEntity(userId);

    if (updateUserDto.email) {
      const email = updateUserDto.email.trim().toLowerCase();

      const emailExists = await this.usersRepository.findOne({
        where: {
          email,
          userId: Not(userId),
          deletedAt: IsNull(),
        },
      });

      if (emailExists) {
        throw new BadRequestException('El correo ya está en uso');
      }

      user.email = email;
    }

    if (updateUserDto.password && updateUserDto.password.trim() !== '') {
      user.password = await bcrypt.hash(updateUserDto.password, SALT_ROUNDS);
    }

    if (updateUserDto.number !== undefined) {
      user.number = updateUserDto.number;
    }

    if (updateUserDto.rol !== undefined) {
      user.rol = updateUserDto.rol;
    }

    if (updateUserDto.name !== undefined) {
      user.name = updateUserDto.name;
    }

    if (updateUserDto.image !== undefined) {
      user.image = updateUserDto.image;
    }

    if (updateUserDto.isVerified !== undefined) {
      user.isVerified = updateUserDto.isVerified;
    }

    if (updateUserDto.isActive !== undefined) {
      user.isActive = updateUserDto.isActive;
    }

    const updatedUser = await this.usersRepository.save(user);

    return {
      ok: true,
      msg: 'Usuario actualizado correctamente',
      user: this.sanitizeUser(updatedUser),
    };
  }

  async softDelete(userId: number) {
    const user = await this.findOneEntity(userId);

    await this.usersRepository.softDelete(user.userId);

    return {
      ok: true,
      msg: 'Usuario eliminado correctamente',
    };
  }

  async restore(userId: number) {
    const user = await this.usersRepository.findOne({
      where: { userId },
      withDeleted: true,
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (user.deletedAt === null) {
      throw new BadRequestException('Este usuario no está eliminado');
    }

    await this.usersRepository.restore(userId);

    const restoredUser = await this.findOneEntity(userId);

    return {
      ok: true,
      msg: 'Usuario restaurado correctamente',
      user: restoredUser,
    };
  }

  async findDeleted() {
    const users = await this.usersRepository.find({
      where: {
        deletedAt: Not(IsNull()),
      },
      withDeleted: true,
      order: {
        userId: 'DESC',
      },
    });

    return {
      ok: true,
      users,
    };
  }

  async saveUser(user: User) {
    return this.usersRepository.save(user);
  }
}