import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsString, IsNotEmpty, IsNumber, IsOptional, IsBoolean, IsDateString, Min } from 'class-validator';

export class CreateMovieDto {
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toUpperCase() : value,
  )
  @ApiProperty({ description: 'Título de la película', example: 'INTERESTELAR' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Sinopsis de la película', example: 'UN GRUPO DE EXPLORADORES VIAJA POR EL ESPACIO.' })
  @IsString()
  @IsOptional()
  synopsis?: string;

  @ApiProperty({ description: 'Duración en minutos', example: 120, minimum: 1 })
  @IsNumber()
  @Min(1)
  durationMinutes: number;

  @ApiProperty({ description: 'Fecha de estreno en formato ISO 8601', example: '2026-09-15' })
  @IsOptional()
  releaseDate?: Date;

  @Transform(({ value }) => {
    if (value === true || value === 'true') return true;
    if (value === false || value === 'false') return false;
    return value;
  })
  @ApiProperty({ description: 'Indica si la película está activa. En multipart acepta true o false.', example: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}