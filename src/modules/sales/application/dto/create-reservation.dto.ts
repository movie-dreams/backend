import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  Max,
  ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ReservationStatus } from '../../domain/enums/reservation-status.enum.js';

export class ReservationSeatDetailDto {
  @ApiProperty({ example: 1, minimum: 1, description: 'ID del asiento a reservar.' })
  @IsInt()
  @IsPositive()
  seatId: number;

  @ApiProperty({ example: 35, minimum: 0, exclusiveMinimum: true, maximum: 99999999.99, multipleOf: 0.01 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @Max(99999999.99)
  price: number;
}

export class CreateReservationDto {
  @ApiProperty({ example: 1, minimum: 1, description: 'ID del cliente.' })
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  clientId: number;

  @ApiProperty({ example: 1, minimum: 1, description: 'ID de la función.' })
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  showtimeId: number;

  @ApiProperty({ example: 'RES-001-2026', description: 'Código de reserva alfanumérico.' })
  @IsString()
  @IsNotEmpty()
  reservationCode: string;

  @ApiProperty({ enum: ReservationStatus, example: ReservationStatus.CONFIRMADA })
  @IsEnum(ReservationStatus)
  status: ReservationStatus;

  @ApiProperty({ example: 70, minimum: 0, exclusiveMinimum: true, maximum: 99999999.99, multipleOf: 0.01 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @Max(99999999.99)
  total: number;

  @ApiProperty({
    type: () => [ReservationSeatDetailDto],
    minItems: 1,
    description: 'Asientos reservados; no se admite repetir seatId.',
  })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayUnique((detail: ReservationSeatDetailDto) => detail.seatId)
  @ValidateNested({ each: true })
  @Type(() => ReservationSeatDetailDto)
  details: ReservationSeatDetailDto[];
}