import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, Repository } from 'typeorm';

import { Favorite } from './entities/favorite.entity';
import { CreateFavoriteDto } from './dto/create-favorite.dto';
import { UpdateFavoriteDto } from './dto/update-favorite.dto';
import { UsersService } from '../users/users.service';
import { ProvidersService } from '../providers/providers.service';

@Injectable()
export class FavoritesService {
  constructor(
    @InjectRepository(Favorite)
    private readonly favoritesRepository: Repository<Favorite>,

    private readonly usersService: UsersService,
    private readonly providersService: ProvidersService,
  ) {}

  async create(createFavoriteDto: CreateFavoriteDto) {
    await this.usersService.findOneEntity(createFavoriteDto.userId);
    await this.providersService.findOneEntity(createFavoriteDto.providerId);

    const exists = await this.favoritesRepository.findOne({
      where: {
        userId: createFavoriteDto.userId,
        providerId: createFavoriteDto.providerId,
      },
      withDeleted: true,
    });

    if (exists && exists.deletedAt === null) {
      throw new BadRequestException(
        'Este proveedor ya está en favoritos para este usuario',
      );
    }

    if (exists && exists.deletedAt !== null) {
      await this.favoritesRepository.restore(exists.favoriteId);

      const restoredFavorite = await this.findOneEntity(exists.favoriteId);

      return {
        ok: true,
        msg: 'Favorito restaurado correctamente',
        favorite: restoredFavorite,
      };
    }

    const favorite = this.favoritesRepository.create({
      userId: createFavoriteDto.userId,
      providerId: createFavoriteDto.providerId,
    });

    const savedFavorite = await this.favoritesRepository.save(favorite);

    return {
      ok: true,
      msg: 'Favorito creado correctamente',
      favorite: savedFavorite,
    };
  }

  async findAll() {
    const favorites = await this.favoritesRepository.find({
      where: {
        deletedAt: IsNull(),
      },
      relations: {
        user: true,
        provider: true,
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

  async findOne(favoriteId: number) {
    const favorite = await this.findOneEntity(favoriteId);

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
        provider: true,
      },
    });

    if (!favorite) {
      throw new NotFoundException('Favorito no encontrado');
    }

    return favorite;
  }

  async findByUserId(userId: number) {
    await this.usersService.findOneEntity(userId);

    const favorites = await this.favoritesRepository.find({
      where: {
        userId,
        deletedAt: IsNull(),
      },
      relations: {
        user: true,
        provider: true,
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

  async findByProviderId(providerId: number) {
    await this.providersService.findOneEntity(providerId);

    const favorites = await this.favoritesRepository.find({
      where: {
        providerId,
        deletedAt: IsNull(),
      },
      relations: {
        user: true,
        provider: true,
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

  async update(favoriteId: number, updateFavoriteDto: UpdateFavoriteDto) {
    const favorite = await this.findOneEntity(favoriteId);

    const newUserId =
      updateFavoriteDto.userId !== undefined
        ? updateFavoriteDto.userId
        : favorite.userId;

    const newProviderId =
      updateFavoriteDto.providerId !== undefined
        ? updateFavoriteDto.providerId
        : favorite.providerId;

    await this.usersService.findOneEntity(newUserId);
    await this.providersService.findOneEntity(newProviderId);

    const duplicated = await this.favoritesRepository.findOne({
      where: {
        userId: newUserId,
        providerId: newProviderId,
        favoriteId: Not(favoriteId),
        deletedAt: IsNull(),
      },
    });

    if (duplicated) {
      throw new BadRequestException(
        'Ya existe este proveedor como favorito para este usuario',
      );
    }

    favorite.userId = newUserId;
    favorite.providerId = newProviderId;

    const updatedFavorite = await this.favoritesRepository.save(favorite);

    return {
      ok: true,
      msg: 'Favorito actualizado correctamente',
      favorite: updatedFavorite,
    };
  }

  async softDelete(favoriteId: number) {
    const favorite = await this.findOneEntity(favoriteId);

    await this.favoritesRepository.softDelete(favorite.favoriteId);

    return {
      ok: true,
      msg: 'Favorito eliminado correctamente',
    };
  }

  async removeByUserAndProvider(userId: number, providerId: number) {
    const favorite = await this.favoritesRepository.findOne({
      where: {
        userId,
        providerId,
        deletedAt: IsNull(),
      },
    });

    if (!favorite) {
      throw new NotFoundException('Favorito no encontrado');
    }

    await this.favoritesRepository.softDelete(favorite.favoriteId);

    return {
      ok: true,
      msg: 'Favorito eliminado correctamente',
    };
  }

  async restore(favoriteId: number) {
    const favorite = await this.favoritesRepository.findOne({
      where: {
        favoriteId,
      },
      withDeleted: true,
    });

    if (!favorite) {
      throw new NotFoundException('Favorito no encontrado');
    }

    if (favorite.deletedAt === null) {
      throw new BadRequestException('Este favorito no está eliminado');
    }

    await this.usersService.findOneEntity(favorite.userId);
    await this.providersService.findOneEntity(favorite.providerId);

    await this.favoritesRepository.restore(favoriteId);

    const restoredFavorite = await this.findOneEntity(favoriteId);

    return {
      ok: true,
      msg: 'Favorito restaurado correctamente',
      favorite: restoredFavorite,
    };
  }

  async findDeleted() {
    const favorites = await this.favoritesRepository.find({
      where: {
        deletedAt: Not(IsNull()),
      },
      withDeleted: true,
      relations: {
        user: true,
        provider: true,
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
}