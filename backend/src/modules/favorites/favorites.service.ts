import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, Repository } from 'typeorm';

import { Favorite } from './entities/favorite.entity';
import { CreateFavoriteDto } from './dto/create-favorite.dto';
import { UpdateFavoriteDto } from './dto/update-favorite.dto';
import { UsersService } from '../users/users.service';
import { WorkersService } from '../workers/workers.service';
import { UserRole } from '../users/entities/user.entity';

@Injectable()
export class FavoritesService {
  constructor(
    @InjectRepository(Favorite)
    private readonly favoritesRepository: Repository<Favorite>,

    private readonly usersService: UsersService,

    private readonly workersService: WorkersService,
  ) {}

  async create(createFavoriteDto: CreateFavoriteDto, currentUser: any) {
    this.validateUserOwner(createFavoriteDto.userId, currentUser);

    await this.usersService.findOneEntity(createFavoriteDto.userId);
    await this.workersService.findOneEntity(createFavoriteDto.workerId);

    const favoriteExists = await this.favoritesRepository.findOne({
      where: {
        userId: createFavoriteDto.userId,
        workerId: createFavoriteDto.workerId,
      },
      withDeleted: true,
    });

    if (favoriteExists && favoriteExists.deletedAt === null) {
      throw new ConflictException('Este trabajador ya está en favoritos');
    }

    if (favoriteExists && favoriteExists.deletedAt !== null) {
      await this.favoritesRepository.restore(favoriteExists.favoriteId);

      favoriteExists.deletedAt = null;

      const restoredFavorite =
        await this.favoritesRepository.save(favoriteExists);

      return {
        ok: true,
        msg: 'Favorito restaurado correctamente',
        favorite: restoredFavorite,
      };
    }

    const favorite = this.favoritesRepository.create({
      userId: createFavoriteDto.userId,
      workerId: createFavoriteDto.workerId,
    });

    const savedFavorite = await this.favoritesRepository.save(favorite);

    return {
      ok: true,
      msg: 'Favorito agregado correctamente',
      favorite: savedFavorite,
    };
  }

  async findAll(currentUser: any) {
    const where = this.isAdmin(currentUser)
      ? { deletedAt: IsNull() }
      : { userId: currentUser.userId, deletedAt: IsNull() };

    const favorites = await this.favoritesRepository.find({
      where,
      relations: {
        user: true,
        worker: true,
      },
      order: {
        favoriteId: 'DESC',
      },
    });

    return {
      ok: true,
      favorites,
    };
  }

  async findDeleted(currentUser: any) {
    const where = this.isAdmin(currentUser)
      ? { deletedAt: Not(IsNull()) }
      : { userId: currentUser.userId, deletedAt: Not(IsNull()) };

    const favorites = await this.favoritesRepository.find({
      where,
      withDeleted: true,
      relations: {
        user: true,
        worker: true,
      },
      order: {
        favoriteId: 'DESC',
      },
    });

    return {
      ok: true,
      favorites,
    };
  }

  async findOne(favoriteId: number, currentUser: any) {
    const favorite = await this.findOneEntity(favoriteId);

    this.validateFavoriteOwner(favorite, currentUser);

    return {
      ok: true,
      favorite,
    };
  }

  async findOneEntity(favoriteId: number) {
    const favorite = await this.favoritesRepository.findOne({
      where: {
        favoriteId,
        deletedAt: IsNull(),
      },
      relations: {
        user: true,
        worker: true,
      },
    });

    if (!favorite) {
      throw new NotFoundException('Favorito no encontrado');
    }

    return favorite;
  }

  async findOneEntityWithDeleted(favoriteId: number) {
    const favorite = await this.favoritesRepository.findOne({
      where: {
        favoriteId,
      },
      withDeleted: true,
      relations: {
        user: true,
        worker: true,
      },
    });

    if (!favorite) {
      throw new NotFoundException('Favorito no encontrado');
    }

    return favorite;
  }

  async findByUserId(userId: number, currentUser: any) {
    this.validateUserOwner(userId, currentUser);

    await this.usersService.findOneEntity(userId);

    const favorites = await this.favoritesRepository.find({
      where: {
        userId,
        deletedAt: IsNull(),
      },
      relations: {
        user: true,
        worker: true,
      },
      order: {
        favoriteId: 'DESC',
      },
    });

    return {
      ok: true,
      favorites,
    };
  }

  async findByWorkerId(workerId: number, currentUser: any) {
    await this.workersService.findOneEntity(workerId);

    const where = this.isAdmin(currentUser)
      ? { workerId, deletedAt: IsNull() }
      : {
          workerId,
          userId: currentUser.userId,
          deletedAt: IsNull(),
        };

    const favorites = await this.favoritesRepository.find({
      where,
      relations: {
        user: true,
        worker: true,
      },
      order: {
        favoriteId: 'DESC',
      },
    });

    return {
      ok: true,
      favorites,
    };
  }

  async update(
    favoriteId: number,
    updateFavoriteDto: UpdateFavoriteDto,
    currentUser: any,
  ) {
    const favorite = await this.findOneEntity(favoriteId);

    this.validateFavoriteOwner(favorite, currentUser);

    const newUserId = updateFavoriteDto.userId ?? favorite.userId;
    const newWorkerId = updateFavoriteDto.workerId ?? favorite.workerId;

    this.validateUserOwner(newUserId, currentUser);

    if (updateFavoriteDto.userId !== undefined) {
      await this.usersService.findOneEntity(updateFavoriteDto.userId);
    }

    if (updateFavoriteDto.workerId !== undefined) {
      await this.workersService.findOneEntity(updateFavoriteDto.workerId);
    }

    const favoriteExists = await this.favoritesRepository.findOne({
      where: {
        userId: newUserId,
        workerId: newWorkerId,
        deletedAt: IsNull(),
      },
    });

    if (favoriteExists && favoriteExists.favoriteId !== favoriteId) {
      throw new ConflictException(
        'Este trabajador ya está en favoritos para este usuario',
      );
    }

    favorite.userId = newUserId;
    favorite.workerId = newWorkerId;

    const updatedFavorite = await this.favoritesRepository.save(favorite);

    return {
      ok: true,
      msg: 'Favorito actualizado correctamente',
      favorite: updatedFavorite,
    };
  }

  async softDelete(favoriteId: number, currentUser: any) {
    const favorite = await this.findOneEntity(favoriteId);

    this.validateFavoriteOwner(favorite, currentUser);

    await this.favoritesRepository.softDelete(favorite.favoriteId);

    return {
      ok: true,
      msg: 'Favorito eliminado correctamente',
    };
  }

  async removeByUserAndWorker(
    userId: number,
    workerId: number,
    currentUser: any,
  ) {
    this.validateUserOwner(userId, currentUser);

    await this.usersService.findOneEntity(userId);
    await this.workersService.findOneEntity(workerId);

    const favorite = await this.favoritesRepository.findOne({
      where: {
        userId,
        workerId,
        deletedAt: IsNull(),
      },
    });

    if (!favorite) {
      throw new NotFoundException(
        'No existe este trabajador en favoritos del usuario',
      );
    }

    await this.favoritesRepository.softDelete(favorite.favoriteId);

    return {
      ok: true,
      msg: 'Favorito eliminado correctamente',
    };
  }

  async restore(favoriteId: number, currentUser: any) {
    const favorite = await this.findOneEntityWithDeleted(favoriteId);

    this.validateFavoriteOwner(favorite, currentUser);

    if (favorite.deletedAt === null) {
      throw new BadRequestException('Este favorito no está eliminado');
    }

    await this.usersService.findOneEntity(favorite.userId);
    await this.workersService.findOneEntity(favorite.workerId);

    const activeFavorite = await this.favoritesRepository.findOne({
      where: {
        userId: favorite.userId,
        workerId: favorite.workerId,
        deletedAt: IsNull(),
      },
    });

    if (activeFavorite) {
      throw new ConflictException(
        'No se puede restaurar porque este favorito ya existe activo',
      );
    }

    await this.favoritesRepository.restore(favoriteId);

    favorite.deletedAt = null;

    const restoredFavorite = await this.favoritesRepository.save(favorite);

    return {
      ok: true,
      msg: 'Favorito restaurado correctamente',
      favorite: restoredFavorite,
    };
  }

  private isAdmin(currentUser: any): boolean {
    return currentUser?.roles?.includes(UserRole.ADMIN);
  }

  private validateFavoriteOwner(
    favorite: Favorite,
    currentUser: any,
  ): void {
    if (this.isAdmin(currentUser)) {
      return;
    }

    if (favorite.userId !== currentUser.userId) {
      throw new ForbiddenException(
        'No puedes acceder a un favorito que no es tuyo',
      );
    }
  }

  private validateUserOwner(userId: number, currentUser: any): void {
    if (this.isAdmin(currentUser)) {
      return;
    }

    if (userId !== currentUser.userId) {
      throw new ForbiddenException(
        'No puedes manejar favoritos de otro usuario',
      );
    }
  }
}