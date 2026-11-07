import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RoomCarteleraDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Sala 1' })
  name: string;

  @ApiProperty({ example: 100 })
  capacity: number;

  @ApiProperty({ example: 'Premium' })
  type: string;

  @ApiProperty({ example: true })
  isActive: boolean;
}

export class RoomSummaryDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Sala 1' })
  room: string;

  @ApiProperty({ example: 100 })
  capacity: number;

  @ApiProperty({
    description:
      'Cuenta todos los asientos registrados, incluidos los inactivos.',
    example: 96,
  })
  registeredSeats: number;
}

export class SeatCarteleraDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 1 })
  roomId: number;

  @ApiProperty({ example: 'Sala 1' })
  room: string;

  @ApiProperty({ example: 'A' })
  row: string;

  @ApiProperty({ example: 1 })
  number: number;

  @ApiProperty({ example: 'A1' })
  seat: string;

  @ApiProperty({ example: 'Estandar' })
  type: string;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiPropertyOptional({
    description:
      'Solo en consulta por función. Comprueba asiento/sala activos, función no cancelada y ausencia de reserva no cancelada. Se valida nuevamente al reservar.',
    example: true,
  })
  available?: boolean;
}

export class ShowtimeCarteleraDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 1 })
  movieId: number;

  @ApiProperty({ example: 'Interstellar' })
  movie: string;

  @ApiProperty({ example: 1 })
  roomId: number;

  @ApiProperty({ example: 'Sala 1' })
  room: string;

  @ApiProperty({ example: 'Premium' })
  roomType: string;

  @ApiProperty({ example: '2026-09-16' })
  date: string;

  @ApiProperty({ example: '19:00:00' })
  startTime: string;

  @ApiProperty({ example: '21:00:00' })
  endTime: string;

  @ApiProperty({ example: 35 })
  price: number;

  @ApiProperty({ example: 'PROGRAMADA' })
  status: string;
}