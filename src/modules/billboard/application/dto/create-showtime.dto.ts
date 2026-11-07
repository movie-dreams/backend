import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  Matches,
  Max,
} from 'class-validator';
import { ShowtimeStatus } from '../../domain/enums/showtime-status.enum.js';

export class CreateShowtimeDto {
  @ApiProperty({ example: 1, description: 'ID de la película', minimum: 1 })
  @IsInt()
  @IsPositive()
  movieId: number;

  @ApiProperty({ example: 1, description: 'ID de la sala', minimum: 1 })
  @IsInt()
  @IsPositive()
  roomId: number;

  @ApiProperty({ example: '2026-10-20', format: 'date', description: 'Fecha local de la función: YYYY-MM-DD.' })
  @IsDateString({ strict: true })
  date: string;

  @ApiProperty({ example: '19:00:00', description: 'Hora local HH:mm:ss, sin zona horaria.' })
  @Matches(/^([01]\d|2[0-3]):[0-5]\d:[0-5]\d$/)
  @IsNotEmpty()
  startTime: string;

  @ApiProperty({ example: '21:00:00', description: 'HH:mm:ss. Debe ser posterior al inicio en el mismo dia.' })
  @Matches(/^([01]\d|2[0-3]):[0-5]\d:[0-5]\d$/)
  @IsNotEmpty()
  endTime: string;

  @ApiProperty({ example: 35, minimum: 0, exclusiveMinimum: true, maximum: 99999999.99, multipleOf: 0.01 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @Max(99999999.99)
  price: number;

  @ApiPropertyOptional({ enum: ShowtimeStatus, default: ShowtimeStatus.PROGRAMADA })
  @IsOptional()
  @IsEnum(ShowtimeStatus)
  status: ShowtimeStatus = ShowtimeStatus.PROGRAMADA;
}

export class ShowtimeCreatedDto extends CreateShowtimeDto {
  @ApiProperty({ example: 1, description: 'ID generado; usar para consultar asientos y reservar.' })
  id: number;
}