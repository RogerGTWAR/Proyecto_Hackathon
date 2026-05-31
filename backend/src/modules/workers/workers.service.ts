import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';

import {
  Worker,
  WorkerStatus,
} from './entities/worker.entity';
import { CreateWorkerDto } from './dto/create-worker.dto';
import { UpdateWorkerDto } from './dto/update-worker.dto';
import { WorkerResponseDto } from './dto/worker-response.dto';
import { UsersService } from '../users/users.service';
import { UserRole } from '../users/entities/user.entity';

@Injectable()
export class WorkersService {
  constructor(
    @InjectRepository(Worker)
    private readonly workersRepository: Repository<Worker>,

    private readonly usersService: UsersService,
  ) {}

  async create(
    createWorkerDto: CreateWorkerDto,
    currentUser: any,
  ): Promise<WorkerResponseDto> {
    if (!this.isAdmin(currentUser)) {
      if (createWorkerDto.userId !== currentUser.userId) {
        throw new ForbiddenException(
          'No puedes crear un perfil worker para otro usuario',
        );
      }
    }

    const user = await this.usersService.findEntityById(
      createWorkerDto.userId,
    );

    if (!user.roles?.includes(UserRole.WORKER)) {
      throw new BadRequestException(
        'El usuario debe tener rol worker para crear un perfil de trabajador',
      );
    }

    const existingWorker = await this.workersRepository.findOne({
      where: {
        userId: createWorkerDto.userId,
      },
      withDeleted: true,
    });

    if (existingWorker && !existingWorker.deletedAt) {
      throw new ConflictException(
        'Este usuario ya tiene un perfil de trabajador',
      );
    }

    if (existingWorker && existingWorker.deletedAt) {
      await this.workersRepository.restore(existingWorker.workerId);

      existingWorker.description = createWorkerDto.description ?? null;
      existingWorker.experience = createWorkerDto.experience ?? null;
      existingWorker.averageRating = createWorkerDto.averageRating ?? 0;
      existingWorker.totalJobs = createWorkerDto.totalJobs ?? 0;
      existingWorker.status = createWorkerDto.status ?? WorkerStatus.ACTIVE;
      existingWorker.deletedAt = null;

      const restoredWorker = await this.workersRepository.save(existingWorker);

      return this.toResponseDto(restoredWorker);
    }

    const worker = this.workersRepository.create({
      userId: createWorkerDto.userId,
      description: createWorkerDto.description ?? null,
      experience: createWorkerDto.experience ?? null,
      averageRating: createWorkerDto.averageRating ?? 0,
      totalJobs: createWorkerDto.totalJobs ?? 0,
      status: createWorkerDto.status ?? WorkerStatus.ACTIVE,
    });

    const savedWorker = await this.workersRepository.save(worker);

    return this.toResponseDto(savedWorker);
  }

  async findAll(): Promise<WorkerResponseDto[]> {
    const workers = await this.workersRepository.find({
      where: {
        deletedAt: IsNull(),
      },
      order: {
        workerId: 'ASC',
      },
    });

    return workers.map((worker) => this.toResponseDto(worker));
  }

  async findDeleted(currentUser: any): Promise<WorkerResponseDto[]> {
    if (!this.isAdmin(currentUser)) {
      throw new ForbiddenException(
        'Solo un administrador puede ver trabajadores eliminados',
      );
    }

    const workers = await this.workersRepository
      .createQueryBuilder('worker')
      .withDeleted()
      .where('worker.deleted_at IS NOT NULL')
      .orderBy('worker.worker_id', 'ASC')
      .getMany();

    return workers.map((worker) => this.toResponseDto(worker));
  }

  async findOne(workerId: number): Promise<WorkerResponseDto> {
    const worker = await this.findOneEntity(workerId);

    return this.toResponseDto(worker);
  }

  async findOneEntity(workerId: number): Promise<Worker> {
    const worker = await this.workersRepository.findOne({
      where: {
        workerId,
        deletedAt: IsNull(),
      },
      relations: {
        user: true,
      },
    });

    if (!worker) {
      throw new NotFoundException('Trabajador no encontrado');
    }

    return worker;
  }

  async findEntityById(workerId: number): Promise<Worker> {
    return this.findOneEntity(workerId);
  }

  async findByUserId(userId: number): Promise<WorkerResponseDto> {
    const worker = await this.workersRepository.findOne({
      where: {
        userId,
        deletedAt: IsNull(),
      },
    });

    if (!worker) {
      throw new NotFoundException(
        'No existe un trabajador asociado a este usuario',
      );
    }

    return this.toResponseDto(worker);
  }

  async update(
    workerId: number,
    updateWorkerDto: UpdateWorkerDto,
    currentUser: any,
  ): Promise<WorkerResponseDto> {
    const worker = await this.findOneEntity(workerId);

    this.validateWorkerOwner(worker, currentUser);

    if (
      updateWorkerDto.userId !== undefined &&
      updateWorkerDto.userId !== worker.userId
    ) {
      if (!this.isAdmin(currentUser)) {
        throw new ForbiddenException(
          'No puedes cambiar el usuario dueño del perfil worker',
        );
      }

      const user = await this.usersService.findEntityById(
        updateWorkerDto.userId,
      );

      if (!user.roles?.includes(UserRole.WORKER)) {
        throw new BadRequestException(
          'El usuario debe tener rol worker para asociarse como trabajador',
        );
      }

      const existingWorker = await this.workersRepository.findOne({
        where: {
          userId: updateWorkerDto.userId,
          deletedAt: IsNull(),
        },
      });

      if (existingWorker && existingWorker.workerId !== workerId) {
        throw new ConflictException(
          'Este usuario ya tiene un perfil de trabajador',
        );
      }

      worker.userId = updateWorkerDto.userId;
    }

    if (updateWorkerDto.description !== undefined) {
      worker.description = updateWorkerDto.description;
    }

    if (updateWorkerDto.experience !== undefined) {
      worker.experience = updateWorkerDto.experience;
    }

    if (updateWorkerDto.averageRating !== undefined) {
      if (!this.isAdmin(currentUser)) {
        throw new ForbiddenException(
          'Solo un administrador puede modificar la calificación promedio',
        );
      }

      worker.averageRating = updateWorkerDto.averageRating;
    }

    if (updateWorkerDto.totalJobs !== undefined) {
      if (!this.isAdmin(currentUser)) {
        throw new ForbiddenException(
          'Solo un administrador puede modificar el total de trabajos',
        );
      }

      worker.totalJobs = updateWorkerDto.totalJobs;
    }

    if (updateWorkerDto.status !== undefined) {
      if (!this.isAdmin(currentUser)) {
        throw new ForbiddenException(
          'Solo un administrador puede cambiar el estado del trabajador',
        );
      }

      worker.status = updateWorkerDto.status;
    }

    const updatedWorker = await this.workersRepository.save(worker);

    return this.toResponseDto(updatedWorker);
  }

  async softDelete(
    workerId: number,
    currentUser: any,
  ): Promise<{ message: string }> {
    const worker = await this.findOneEntity(workerId);

    this.validateWorkerOwner(worker, currentUser);

    worker.status = WorkerStatus.INACTIVE;
    await this.workersRepository.save(worker);

    await this.workersRepository.softDelete(workerId);

    return {
      message: 'Trabajador eliminado correctamente',
    };
  }

  async restore(
    workerId: number,
    currentUser: any,
  ): Promise<WorkerResponseDto> {
    const worker = await this.workersRepository.findOne({
      where: {
        workerId,
      },
      withDeleted: true,
    });

    if (!worker) {
      throw new NotFoundException('Trabajador no encontrado');
    }

    this.validateWorkerOwner(worker, currentUser);

    if (!worker.deletedAt) {
      return this.toResponseDto(worker);
    }

    const activeWorkerWithSameUser = await this.workersRepository.findOne({
      where: {
        userId: worker.userId,
        deletedAt: IsNull(),
      },
    });

    if (activeWorkerWithSameUser) {
      throw new ConflictException(
        'No se puede restaurar porque este usuario ya tiene un perfil de trabajador activo',
      );
    }

    await this.workersRepository.restore(workerId);

    worker.deletedAt = null;
    worker.status = WorkerStatus.ACTIVE;

    const restoredWorker = await this.workersRepository.save(worker);

    return this.toResponseDto(restoredWorker);
  }

  private isAdmin(currentUser: any): boolean {
    return currentUser?.roles?.includes(UserRole.ADMIN);
  }

  private validateWorkerOwner(worker: Worker, currentUser: any): void {
    if (this.isAdmin(currentUser)) {
      return;
    }

    if (worker.userId !== currentUser.userId) {
      throw new ForbiddenException(
        'No puedes modificar un perfil de trabajador que no es tuyo',
      );
    }
  }

  private toResponseDto(worker: Worker): WorkerResponseDto {
    return {
      workerId: worker.workerId,
      userId: worker.userId,
      description: worker.description,
      experience: worker.experience,
      averageRating: Number(worker.averageRating),
      totalJobs: worker.totalJobs,
      status: worker.status,
      createdAt: worker.createdAt,
      updatedAt: worker.updatedAt,
    };
  }
}