import { IsInt, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateProviderDto {
  @IsInt({ message: 'El userId debe ser un número entero' })
  userId!: number;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  state?: string;
}