import {
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateLocationDto {
  @IsInt({ message: 'El userId debe ser un número entero' })
  @Type(() => Number)
  userId!: number;

  @IsOptional()
  @IsNumber({}, { message: 'La latitud debe ser un número' })
  @Min(-90, { message: 'La latitud no puede ser menor que -90' })
  @Max(90, { message: 'La latitud no puede ser mayor que 90' })
  @Type(() => Number)
  latitude?: number;

  @IsOptional()
  @IsNumber({}, { message: 'La longitud debe ser un número' })
  @Min(-180, { message: 'La longitud no puede ser menor que -180' })
  @Max(180, { message: 'La longitud no puede ser mayor que 180' })
  @Type(() => Number)
  longitude?: number;

  @IsOptional()
  @IsString()
  @MaxLength(500, {
    message: 'La dirección no puede tener más de 500 caracteres',
  })
  address?: string;
}