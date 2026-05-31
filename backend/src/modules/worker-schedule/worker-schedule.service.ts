import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';

import { WorkerSchedule } from './entities/worker-schedule.entity';
import { CreateWorkerScheduleDto } from './dto/create-worker-schedule.dto';
import { UpdateWorkerScheduleDto } from './dto/update-worker-schedule.dto';
import { WorkerScheduleResponseDto } from './dto/worker-schedule-response.dto';
import { WorkersService } from '../workers/workers.service';
import { UserRole } from '../users/entities/user.entity';

@Injectable()
export class WorkerScheduleService {
  constructor(
    @InjectRepository(WorkerSchedule)
    private readonly workerScheduleRepository: Repository<WorkerSchedule>,

    private readonly workersService: WorkersService,
  ) {}

  async create(
    createDto: CreateWorkerScheduleDto,
    currentUser: any,
  ): Promise<WorkerScheduleResponseDto> {
    const worker = await this.workersService.findOneEntity(createDto.workerId);

    this.validateWorkerOwner(worker.userId, currentUser);

    const dayOfWeek = this.normalizeDay(createDto.dayOfWeek);
    const startTime = this.normalizeTime(createDto.startTime);
    const endTime = this.normalizeTime(createDto.endTime);

    this.validateTimeRange(startTime, endTime);

    await this.validateDuplicateSchedule(
      createDto.workerId,
      dayOfWeek,
      startTime,
      endTime,
    );

    await this.validateScheduleOverlap(
      createDto.workerId,
      dayOfWeek,
      startTime,
      endTime,
    );

    const schedule = this.workerScheduleRepository.create({
      workerId: createDto.workerId,
      dayOfWeek,
      startTime,
      endTime,
      isActive: createDto.isActive ?? true,
    });

    const savedSchedule = await this.workerScheduleRepository.save(schedule);

    return this.toResponseDto(savedSchedule);
  }

  async findAll(): Promise<WorkerScheduleResponseDto[]> {
    const schedules = await this.workerScheduleRepository.find({
      where: {
        deletedAt: IsNull(),
      },
      order: {
        scheduleId: 'ASC',
      },
    });

    return schedules.map((schedule) => this.toResponseDto(schedule));
  }

  async findDeleted(currentUser: any): Promise<WorkerScheduleResponseDto[]> {
    if (!this.isAdmin(currentUser)) {
      throw new ForbiddenException(
        'Solo un administrador puede ver horarios eliminados',
      );
    }

    const schedules = await this.workerScheduleRepository
      .createQueryBuilder('schedule')
      .withDeleted()
      .where('schedule.deleted_at IS NOT NULL')
      .orderBy('schedule.schedule_id', 'ASC')
      .getMany();

    return schedules.map((schedule) => this.toResponseDto(schedule));
  }

  async findByWorkerId(
    workerId: number,
    currentUser: any,
  ): Promise<WorkerScheduleResponseDto[]> {
    const worker = await this.workersService.findOneEntity(workerId);

    if (
      !this.isAdmin(currentUser) &&
      currentUser?.roles?.includes(UserRole.WORKER)
    ) {
      this.validateWorkerOwner(worker.userId, currentUser);
    }

    const schedules = await this.workerScheduleRepository.find({
      where: {
        workerId,
        deletedAt: IsNull(),
      },
      order: {
        dayOfWeek: 'ASC',
        startTime: 'ASC',
      },
    });

    return schedules.map((schedule) => this.toResponseDto(schedule));
  }

  async findOne(scheduleId: number): Promise<WorkerScheduleResponseDto> {
    const schedule = await this.findOneEntity(scheduleId);

    return this.toResponseDto(schedule);
  }

  async findOneEntity(scheduleId: number): Promise<WorkerSchedule> {
    const schedule = await this.workerScheduleRepository.findOne({
      where: {
        scheduleId,
        deletedAt: IsNull(),
      },
      relations: {
        worker: true,
      },
    });

    if (!schedule) {
      throw new NotFoundException('Horario del trabajador no encontrado');
    }

    return schedule;
  }

  async findOneEntityWithDeleted(
    scheduleId: number,
  ): Promise<WorkerSchedule> {
    const schedule = await this.workerScheduleRepository.findOne({
      where: {
        scheduleId,
      },
      withDeleted: true,
      relations: {
        worker: true,
      },
    });

    if (!schedule) {
      throw new NotFoundException('Horario del trabajador no encontrado');
    }

    return schedule;
  }

  async update(
    scheduleId: number,
    updateDto: UpdateWorkerScheduleDto,
    currentUser: any,
  ): Promise<WorkerScheduleResponseDto> {
    const schedule = await this.findOneEntity(scheduleId);

    const currentWorker = await this.workersService.findOneEntity(
      schedule.workerId,
    );

    this.validateWorkerOwner(currentWorker.userId, currentUser);

    const newWorkerId = updateDto.workerId ?? schedule.workerId;

    if (updateDto.workerId !== undefined) {
      if (!this.isAdmin(currentUser)) {
        throw new ForbiddenException(
          'No puedes cambiar el trabajador dueño del horario',
        );
      }

      await this.workersService.findOneEntity(updateDto.workerId);
    }

    const newDayOfWeek =
      updateDto.dayOfWeek !== undefined
        ? this.normalizeDay(updateDto.dayOfWeek)
        : schedule.dayOfWeek;

    const newStartTime =
      updateDto.startTime !== undefined
        ? this.normalizeTime(updateDto.startTime)
        : this.normalizeTime(schedule.startTime);

    const newEndTime =
      updateDto.endTime !== undefined
        ? this.normalizeTime(updateDto.endTime)
        : this.normalizeTime(schedule.endTime);

    this.validateTimeRange(newStartTime, newEndTime);

    await this.validateDuplicateSchedule(
      newWorkerId,
      newDayOfWeek,
      newStartTime,
      newEndTime,
      scheduleId,
    );

    await this.validateScheduleOverlap(
      newWorkerId,
      newDayOfWeek,
      newStartTime,
      newEndTime,
      scheduleId,
    );

    schedule.workerId = newWorkerId;
    schedule.dayOfWeek = newDayOfWeek;
    schedule.startTime = newStartTime;
    schedule.endTime = newEndTime;

    if (updateDto.isActive !== undefined) {
      schedule.isActive = updateDto.isActive;
    }

    const updatedSchedule =
      await this.workerScheduleRepository.save(schedule);

    return this.toResponseDto(updatedSchedule);
  }

  async softDelete(
    scheduleId: number,
    currentUser: any,
  ): Promise<{ message: string }> {
    const schedule = await this.findOneEntity(scheduleId);

    const worker = await this.workersService.findOneEntity(schedule.workerId);

    this.validateWorkerOwner(worker.userId, currentUser);

    schedule.isActive = false;
    await this.workerScheduleRepository.save(schedule);

    await this.workerScheduleRepository.softDelete(scheduleId);

    return {
      message: 'Horario eliminado correctamente',
    };
  }

  async restore(
    scheduleId: number,
    currentUser: any,
  ): Promise<WorkerScheduleResponseDto> {
    const schedule = await this.findOneEntityWithDeleted(scheduleId);

    const worker = await this.workersService.findOneEntity(schedule.workerId);

    this.validateWorkerOwner(worker.userId, currentUser);

    if (schedule.deletedAt === null) {
      throw new BadRequestException('Este horario no está eliminado');
    }

    const startTime = this.normalizeTime(schedule.startTime);
    const endTime = this.normalizeTime(schedule.endTime);

    this.validateTimeRange(startTime, endTime);

    await this.validateDuplicateSchedule(
      schedule.workerId,
      schedule.dayOfWeek,
      startTime,
      endTime,
      schedule.scheduleId,
    );

    await this.validateScheduleOverlap(
      schedule.workerId,
      schedule.dayOfWeek,
      startTime,
      endTime,
      schedule.scheduleId,
    );

    await this.workerScheduleRepository.restore(scheduleId);

    schedule.deletedAt = null;
    schedule.isActive = true;

    const restoredSchedule =
      await this.workerScheduleRepository.save(schedule);

    return this.toResponseDto(restoredSchedule);
  }

  private validateTimeRange(startTime: string, endTime: string): void {
    if (startTime >= endTime) {
      throw new BadRequestException(
        'La hora de inicio debe ser menor que la hora final',
      );
    }
  }

  private async validateDuplicateSchedule(
    workerId: number,
    dayOfWeek: string,
    startTime: string,
    endTime: string,
    scheduleIdToIgnore?: number,
  ): Promise<void> {
    const query = this.workerScheduleRepository
      .createQueryBuilder('schedule')
      .where('schedule.worker_id = :workerId', { workerId })
      .andWhere('schedule.day_of_week = :dayOfWeek', { dayOfWeek })
      .andWhere('schedule.start_time = :startTime', { startTime })
      .andWhere('schedule.end_time = :endTime', { endTime })
      .andWhere('schedule.deleted_at IS NULL');

    if (scheduleIdToIgnore !== undefined) {
      query.andWhere('schedule.schedule_id != :scheduleIdToIgnore', {
        scheduleIdToIgnore,
      });
    }

    const existingSchedule = await query.getOne();

    if (existingSchedule) {
      throw new ConflictException(
        'El trabajador ya tiene registrado ese mismo horario',
      );
    }
  }

  private async validateScheduleOverlap(
    workerId: number,
    dayOfWeek: string,
    startTime: string,
    endTime: string,
    scheduleIdToIgnore?: number,
  ): Promise<void> {
    const query = this.workerScheduleRepository
      .createQueryBuilder('schedule')
      .where('schedule.worker_id = :workerId', { workerId })
      .andWhere('schedule.day_of_week = :dayOfWeek', { dayOfWeek })
      .andWhere('schedule.deleted_at IS NULL')
      .andWhere('schedule.is_active = true')
      .andWhere(
        `
        (:startTime < schedule.end_time AND :endTime > schedule.start_time)
        `,
        {
          startTime,
          endTime,
        },
      );

    if (scheduleIdToIgnore !== undefined) {
      query.andWhere('schedule.schedule_id != :scheduleIdToIgnore', {
        scheduleIdToIgnore,
      });
    }

    const overlappingSchedule = await query.getOne();

    if (overlappingSchedule) {
      throw new ConflictException(
        'El horario se cruza con otro horario activo del trabajador',
      );
    }
  }

  private isAdmin(currentUser: any): boolean {
    return currentUser?.roles?.includes(UserRole.ADMIN);
  }

  private validateWorkerOwner(workerUserId: number, currentUser: any): void {
    if (this.isAdmin(currentUser)) {
      return;
    }

    if (workerUserId !== currentUser.userId) {
      throw new ForbiddenException(
        'No puedes manejar horarios de otro trabajador',
      );
    }
  }

  private normalizeDay(dayOfWeek: string): string {
    return dayOfWeek.trim().toLowerCase();
  }

  private normalizeTime(time: string): string {
    return time.trim().slice(0, 5);
  }

  private toResponseDto(
    schedule: WorkerSchedule,
  ): WorkerScheduleResponseDto {
    return {
      scheduleId: schedule.scheduleId,
      workerId: schedule.workerId,
      dayOfWeek: schedule.dayOfWeek,
      startTime: this.normalizeTime(schedule.startTime),
      endTime: this.normalizeTime(schedule.endTime),
      isActive: schedule.isActive,
      createdAt: schedule.createdAt,
      updatedAt: schedule.updatedAt,
    };
  }
}