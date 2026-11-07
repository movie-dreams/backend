import { ApiProperty } from '@nestjs/swagger';
import { ReservationStatus } from '../../domain/enums/reservation-status.enum.js';

export class ReservationDetailResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 1 })
  reservationId: number;

  @ApiProperty({ example: 3 })
  seatId: number;

  @ApiProperty({ example: 35 })
  price: number;
}

export class ReservationResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 1 })
  clientId: number;

  @ApiProperty({ example: 1 })
  showtimeId: number;

  @ApiProperty({ example: '2026-09-22T10:30:00.000Z' })
  reservationDate: Date;

  @ApiProperty({ example: 'RES-001-2026' })
  reservationCode: string;

  @ApiProperty({ enum: ReservationStatus, example: ReservationStatus.PENDIENTE })
  status: string;

  @ApiProperty({ example: 70 })
  total: number;

  @ApiProperty({ type: () => [ReservationDetailResponseDto] })
  details?: ReservationDetailResponseDto[];
}

export class ReservationCreatedDto {
  @ApiProperty({ type: () => ReservationResponseDto })
  reservation: ReservationResponseDto;

  @ApiProperty({ type: () => [ReservationDetailResponseDto] })
  details: ReservationDetailResponseDto[];
}