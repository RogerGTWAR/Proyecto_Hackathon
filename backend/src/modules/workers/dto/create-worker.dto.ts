import {
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

import { WorkerStatus } from '../entities/worker.entity';

export class CreateWorkerDto {
  @IsInt({ message: 'El userId debe ser un número entero' })
  userId!: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  experience?: string;

  @IsOptional()
  @IsNumber({}, { message: 'El promedio de calificación debe ser numérico' })
  @Min(0)
  @Max(5)
  averageRating?: number;

  @IsOptional()
  @IsInt({ message: 'El total de trabajos debe ser un número entero' })
  @Min(0)
  totalJobs?: number;

  @IsOptional()
  @IsEnum(WorkerStatus, {
    message: 'El estado del trabajador no es válido',
  })
  status?: WorkerStatus;
}