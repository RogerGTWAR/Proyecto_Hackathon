import { IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateFavoriteDto {
  @IsInt({ message: 'El userId debe ser un número entero' })
  @Type(() => Number)
  userId!: number;

  @IsInt({ message: 'El workerId debe ser un número entero' })
  @Type(() => Number)
  workerId!: number;
}