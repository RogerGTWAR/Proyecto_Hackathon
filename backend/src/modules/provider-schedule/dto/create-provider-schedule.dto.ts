import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsString,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProviderScheduleDto {
  @IsInt({ message: 'El providerId debe ser un número entero' })
  @Type(() => Number)
  providerId!: number;

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
  day!: string;

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
}