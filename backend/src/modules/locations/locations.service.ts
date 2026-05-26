import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, Repository } from 'typeorm';

import { Location } from './entities/location.entity';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class LocationsService {
  constructor(
    @InjectRepository(Location)
    private readonly locationsRepository: Repository<Location>,

    private readonly usersService: UsersService,
  ) {}

  async create(createLocationDto: CreateLocationDto) {
    await this.usersService.findOneEntity(createLocationDto.userId);

    if (
      createLocationDto.latitude === undefined &&
      createLocationDto.longitude === undefined &&
      !createLocationDto.address
    ) {
      throw new BadRequestException(
        'Debes enviar al menos una dirección o coordenadas',
      );
    }

    if (
      createLocationDto.latitude !== undefined &&
      createLocationDto.longitude === undefined
    ) {
      throw new BadRequestException(
        'Si envías latitud, también debes enviar longitud',
      );
    }

    if (
      createLocationDto.longitude !== undefined &&
      createLocationDto.latitude === undefined
    ) {
      throw new BadRequestException(
        'Si envías longitud, también debes enviar latitud',
      );
    }

    const location = this.locationsRepository.create({
      userId: createLocationDto.userId,
      latitude: createLocationDto.latitude ?? null,
      longitude: createLocationDto.longitude ?? null,
      address: createLocationDto.address ?? null,
    });

    const savedLocation = await this.locationsRepository.save(location);

    return {
      ok: true,
      msg: 'Ubicación creada correctamente',
      location: savedLocation,
    };
  }

  async findAll() {
    const locations = await this.locationsRepository.find({
      where: {
        deletedAt: IsNull(),
      },
      relations: {
        user: true,
      },
      order: {
        locationId: 'DESC',
      },
    });

    return {
      ok: true,
      locations,
    };
  }

  async findOne(locationId: number) {
    const location = await this.locationsRepository.findOne({
      where: {
        locationId,
        deletedAt: IsNull(),
      },
      relations: {
        user: true,
      },
    });

    if (!location) {
      throw new NotFoundException('Ubicación no encontrada');
    }

    return {
      ok: true,
      location,
    };
  }

  async findOneEntity(locationId: number) {
    const location = await this.locationsRepository.findOne({
      where: {
        locationId,
        deletedAt: IsNull(),
      },
      relations: {
        user: true,
      },
    });

    if (!location) {
      throw new NotFoundException('Ubicación no encontrada');
    }

    return location;
  }

  async findByUserId(userId: number) {
    await this.usersService.findOneEntity(userId);

    const locations = await this.locationsRepository.find({
      where: {
        userId,
        deletedAt: IsNull(),
      },
      relations: {
        user: true,
      },
      order: {
        locationId: 'DESC',
      },
    });

    return {
      ok: true,
      locations,
    };
  }

  async update(locationId: number, updateLocationDto: UpdateLocationDto) {
    const location = await this.findOneEntity(locationId);

    if (updateLocationDto.userId !== undefined) {
      await this.usersService.findOneEntity(updateLocationDto.userId);
      location.userId = updateLocationDto.userId;
    }

    const newLatitude =
      updateLocationDto.latitude !== undefined
        ? updateLocationDto.latitude
        : location.latitude;

    const newLongitude =
      updateLocationDto.longitude !== undefined
        ? updateLocationDto.longitude
        : location.longitude;

    if (
      (newLatitude !== null && newLongitude === null) ||
      (newLongitude !== null && newLatitude === null)
    ) {
      throw new BadRequestException(
        'La latitud y la longitud deben enviarse juntas',
      );
    }

    if (updateLocationDto.latitude !== undefined) {
      location.latitude = updateLocationDto.latitude;
    }

    if (updateLocationDto.longitude !== undefined) {
      location.longitude = updateLocationDto.longitude;
    }

    if (updateLocationDto.address !== undefined) {
      location.address = updateLocationDto.address;
    }

    const updatedLocation = await this.locationsRepository.save(location);

    return {
      ok: true,
      msg: 'Ubicación actualizada correctamente',
      location: updatedLocation,
    };
  }

  async softDelete(locationId: number) {
    const location = await this.findOneEntity(locationId);

    await this.locationsRepository.softDelete(location.locationId);

    return {
      ok: true,
      msg: 'Ubicación eliminada correctamente',
    };
  }

  async restore(locationId: number) {
    const location = await this.locationsRepository.findOne({
      where: {
        locationId,
      },
      withDeleted: true,
    });

    if (!location) {
      throw new NotFoundException('Ubicación no encontrada');
    }

    if (location.deletedAt === null) {
      throw new BadRequestException('Esta ubicación no está eliminada');
    }

    await this.locationsRepository.restore(locationId);

    const restoredLocation = await this.findOneEntity(locationId);

    return {
      ok: true,
      msg: 'Ubicación restaurada correctamente',
      location: restoredLocation,
    };
  }

  async findDeleted() {
    const locations = await this.locationsRepository.find({
      where: {
        deletedAt: Not(IsNull()),
      },
      withDeleted: true,
      relations: {
        user: true,
      },
      order: {
        locationId: 'DESC',
      },
    });

    return {
      ok: true,
      locations,
    };
  }
}