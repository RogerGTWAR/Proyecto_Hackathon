import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, Repository } from 'typeorm';

import { ProviderSchedule } from './entities/provider-schedule.entity';
import { CreateProviderScheduleDto } from './dto/create-provider-schedule.dto';
import { UpdateProviderScheduleDto } from './dto/update-provider-schedule.dto';
import { ProvidersService } from '../providers/providers.service';

@Injectable()
export class ProviderScheduleService {
  constructor(
    @InjectRepository(ProviderSchedule)
    private readonly scheduleRepository: Repository<ProviderSchedule>,

    private readonly providersService: ProvidersService,
  ) {}

  private normalizeDay(day: string) {
    return day.trim().toLowerCase();
  }

  private validateTimeRange(startTime: string, endTime: string) {
    if (startTime >= endTime) {
      throw new BadRequestException(
        'La hora de inicio debe ser menor que la hora final',
      );
    }
  }

  async create(createDto: CreateProviderScheduleDto) {
    await this.providersService.findOneEntity(createDto.providerId);

    const day = this.normalizeDay(createDto.day);

    this.validateTimeRange(createDto.startTime, createDto.endTime);

    const exists = await this.scheduleRepository.findOne({
      where: {
        providerId: createDto.providerId,
        day,
        deletedAt: IsNull(),
      },
    });

    if (exists) {
      throw new BadRequestException(
        'Este proveedor ya tiene un horario registrado para ese día',
      );
    }

    const schedule = this.scheduleRepository.create({
      providerId: createDto.providerId,
      day,
      startTime: createDto.startTime,
      endTime: createDto.endTime,
    });

    const savedSchedule = await this.scheduleRepository.save(schedule);

    return {
      ok: true,
      msg: 'Horario creado correctamente',
      schedule: savedSchedule,
    };
  }

  async findAll() {
    const schedules = await this.scheduleRepository.find({
      where: {
        deletedAt: IsNull(),
      },
      relations: {
        provider: true,
      },
      order: {
        providerScheduleId: 'DESC',
      },
    });

    return {
      ok: true,
      schedules,
    };
  }

  async findOne(providerScheduleId: number) {
    const schedule = await this.scheduleRepository.findOne({
      where: {
        providerScheduleId,
        deletedAt: IsNull(),
      },
      relations: {
        provider: true,
      },
    });

    if (!schedule) {
      throw new NotFoundException('Horario no encontrado');
    }

    return {
      ok: true,
      schedule,
    };
  }

  async findOneEntity(providerScheduleId: number) {
    const schedule = await this.scheduleRepository.findOne({
      where: {
        providerScheduleId,
        deletedAt: IsNull(),
      },
      relations: {
        provider: true,
      },
    });

    if (!schedule) {
      throw new NotFoundException('Horario no encontrado');
    }

    return schedule;
  }

  async findByProviderId(providerId: number) {
    await this.providersService.findOneEntity(providerId);

    const schedules = await this.scheduleRepository.find({
      where: {
        providerId,
        deletedAt: IsNull(),
      },
      relations: {
        provider: true,
      },
      order: {
        providerScheduleId: 'ASC',
      },
    });

    return {
      ok: true,
      schedules,
    };
  }

  async update(
    providerScheduleId: number,
    updateDto: UpdateProviderScheduleDto,
  ) {
    const schedule = await this.findOneEntity(providerScheduleId);

    if (updateDto.providerId !== undefined) {
      await this.providersService.findOneEntity(updateDto.providerId);
      schedule.providerId = updateDto.providerId;
    }

    const newDay =
      updateDto.day !== undefined
        ? this.normalizeDay(updateDto.day)
        : schedule.day;

    const newStartTime =
      updateDto.startTime !== undefined
        ? updateDto.startTime
        : schedule.startTime;

    const newEndTime =
      updateDto.endTime !== undefined ? updateDto.endTime : schedule.endTime;

    this.validateTimeRange(newStartTime, newEndTime);

    const providerIdToValidate =
      updateDto.providerId !== undefined ? updateDto.providerId : schedule.providerId;

    const duplicated = await this.scheduleRepository.findOne({
      where: {
        providerId: providerIdToValidate,
        day: newDay,
        providerScheduleId: Not(providerScheduleId),
        deletedAt: IsNull(),
      },
    });

    if (duplicated) {
      throw new BadRequestException(
        'Este proveedor ya tiene otro horario registrado para ese día',
      );
    }

    schedule.day = newDay;
    schedule.startTime = newStartTime;
    schedule.endTime = newEndTime;

    const updatedSchedule = await this.scheduleRepository.save(schedule);

    return {
      ok: true,
      msg: 'Horario actualizado correctamente',
      schedule: updatedSchedule,
    };
  }

  async softDelete(providerScheduleId: number) {
    const schedule = await this.findOneEntity(providerScheduleId);

    await this.scheduleRepository.softDelete(schedule.providerScheduleId);

    return {
      ok: true,
      msg: 'Horario eliminado correctamente',
    };
  }

  async restore(providerScheduleId: number) {
    const schedule = await this.scheduleRepository.findOne({
      where: {
        providerScheduleId,
      },
      withDeleted: true,
    });

    if (!schedule) {
      throw new NotFoundException('Horario no encontrado');
    }

    if (schedule.deletedAt === null) {
      throw new BadRequestException('Este horario no está eliminado');
    }

    await this.scheduleRepository.restore(providerScheduleId);

    const restoredSchedule = await this.findOneEntity(providerScheduleId);

    return {
      ok: true,
      msg: 'Horario restaurado correctamente',
      schedule: restoredSchedule,
    };
  }

  async findDeleted() {
    const schedules = await this.scheduleRepository.find({
      where: {
        deletedAt: Not(IsNull()),
      },
      withDeleted: true,
      relations: {
        provider: true,
      },
      order: {
        providerScheduleId: 'DESC',
      },
    });

    return {
      ok: true,
      schedules,
    };
  }
}