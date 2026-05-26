import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, Repository } from 'typeorm';

import { Provider } from './entities/provider.entity';
import { CreateProviderDto } from './dto/create-provider.dto';
import { UpdateProviderDto } from './dto/update-provider.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class ProvidersService {
  constructor(
    @InjectRepository(Provider)
    private readonly providersRepository: Repository<Provider>,

    private readonly usersService: UsersService,
  ) {}

  async create(createProviderDto: CreateProviderDto) {
    const user = await this.usersService.findOneEntity(
      createProviderDto.userId,
    );

    const providerExists = await this.providersRepository.findOne({
      where: {
        userId: createProviderDto.userId,
      },
      withDeleted: true,
    });

    if (providerExists && providerExists.deletedAt === null) {
      throw new BadRequestException(
        'Este usuario ya está registrado como proveedor',
      );
    }

    if (providerExists && providerExists.deletedAt !== null) {
      throw new BadRequestException(
        'Este usuario tiene un proveedor eliminado. Restaura el proveedor o usa otro usuario.',
      );
    }

    if (user.rol !== 'provider') {
      user.rol = 'provider';
      await this.usersService.saveUser(user);
    }

    const provider = this.providersRepository.create({
      userId: createProviderDto.userId,
      description: createProviderDto.description ?? null,
      state: createProviderDto.state ?? 'activo',
    });

    const savedProvider = await this.providersRepository.save(provider);

    return {
      ok: true,
      msg: 'Proveedor creado correctamente',
      provider: savedProvider,
    };
  }

  async findAll() {
    const providers = await this.providersRepository.find({
      where: {
        deletedAt: IsNull(),
      },
      relations: {
        user: true,
      },
      order: {
        providerId: 'DESC',
      },
    });

    return {
      ok: true,
      providers,
    };
  }

  async findOne(providerId: number) {
    const provider = await this.providersRepository.findOne({
      where: {
        providerId,
        deletedAt: IsNull(),
      },
      relations: {
        user: true,
      },
    });

    if (!provider) {
      throw new NotFoundException('Proveedor no encontrado');
    }

    return {
      ok: true,
      provider,
    };
  }

  async findOneEntity(providerId: number) {
    const provider = await this.providersRepository.findOne({
      where: {
        providerId,
        deletedAt: IsNull(),
      },
      relations: {
        user: true,
      },
    });

    if (!provider) {
      throw new NotFoundException('Proveedor no encontrado');
    }

    return provider;
  }

  async findByUserId(userId: number) {
    const provider = await this.providersRepository.findOne({
      where: {
        userId,
        deletedAt: IsNull(),
      },
      relations: {
        user: true,
      },
    });

    if (!provider) {
      throw new NotFoundException('Proveedor no encontrado para este usuario');
    }

    return {
      ok: true,
      provider,
    };
  }

  async update(providerId: number, updateProviderDto: UpdateProviderDto) {
    const provider = await this.findOneEntity(providerId);

    if (updateProviderDto.userId !== undefined) {
      const user = await this.usersService.findOneEntity(
        updateProviderDto.userId,
      );

      const userAlreadyProvider = await this.providersRepository.findOne({
        where: {
          userId: updateProviderDto.userId,
          providerId: Not(providerId),
          deletedAt: IsNull(),
        },
      });

      if (userAlreadyProvider) {
        throw new BadRequestException(
          'Este usuario ya está asignado a otro proveedor',
        );
      }

      if (user.rol !== 'provider') {
        user.rol = 'provider';
        await this.usersService.saveUser(user);
      }

      provider.userId = updateProviderDto.userId;
    }

    if (updateProviderDto.description !== undefined) {
      provider.description = updateProviderDto.description;
    }

    if (updateProviderDto.state !== undefined) {
      provider.state = updateProviderDto.state;
    }

    const updatedProvider = await this.providersRepository.save(provider);

    return {
      ok: true,
      msg: 'Proveedor actualizado correctamente',
      provider: updatedProvider,
    };
  }

  async softDelete(providerId: number) {
    const provider = await this.findOneEntity(providerId);

    await this.providersRepository.softDelete(provider.providerId);

    return {
      ok: true,
      msg: 'Proveedor eliminado correctamente',
    };
  }

  async restore(providerId: number) {
    const provider = await this.providersRepository.findOne({
      where: {
        providerId,
      },
      withDeleted: true,
    });

    if (!provider) {
      throw new NotFoundException('Proveedor no encontrado');
    }

    if (provider.deletedAt === null) {
      throw new BadRequestException('Este proveedor no está eliminado');
    }

    await this.providersRepository.restore(providerId);

    const restoredProvider = await this.findOneEntity(providerId);

    return {
      ok: true,
      msg: 'Proveedor restaurado correctamente',
      provider: restoredProvider,
    };
  }

  async findDeleted() {
    const providers = await this.providersRepository.find({
      where: {
        deletedAt: Not(IsNull()),
      },
      withDeleted: true,
      relations: {
        user: true,
      },
      order: {
        providerId: 'DESC',
      },
    });

    return {
      ok: true,
      providers,
    };
  }
}