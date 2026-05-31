import {
  IsBoolean,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateWorkerScheduleDto {
  @IsInt({ message: 'El workerId debe ser un número entero' })
  @Type(() => Number)
  workerId!: number;

  @IsString()
  @IsNotEmpty({ message: 'El día es obligatorio' })
  @IsIn(
    [
      'lunes',
      'martes',
      'miércoles',
      'jueves',
      'viernes',
      'sábado',
      'domingo',
    ],
    {
      message:
        'El día debe ser: lunes, martes, miércoles, jueves, viernes, sábado o domingo',
    },
  )
  dayOfWeek!: string;

  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'La hora de inicio debe tener formato HH:mm. Ejemplo: 08:00',
  })
  startTime!: string;

  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'La hora final debe tener formato HH:mm. Ejemplo: 17:00',
  })
  endTime!: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}