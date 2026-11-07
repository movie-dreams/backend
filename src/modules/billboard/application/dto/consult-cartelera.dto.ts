import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';

export class ConsultRoomsQueryDto {
  @ApiPropertyOptional({ description: 'Filtra solo salas activas', example: true })
  @IsOptional()
  @Type(() => Boolean)
  onlyActive?: boolean;
}

export class ConsultSeatsQueryDto {
  @ApiPropertyOptional({ minimum: 1, example: 1, description: 'ID de la sala' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  roomId?: number;
}

export class ConsultShowtimesQueryDto {
  @ApiPropertyOptional({ minimum: 1, example: 1, description: 'ID de la película' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  movieId?: number;
}

export class ShowtimeParamDto {
  @ApiProperty({ minimum: 1, example: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  id: number;
}