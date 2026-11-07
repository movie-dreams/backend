import { Type } from 'class-transformer';
import { IsInt, IsNumber, IsPositive, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateReservationDetailDto {
  @ApiProperty({ example: 1, minimum: 1, description: 'ID de la reserva.' })
  @Type(() => Number)
  @IsInt()
  reservationId: number;

  @ApiProperty({ example: 3, minimum: 1, description: 'ID del asiento.' })
  @Type(() => Number)
  @IsInt()
  seatId: number;

  @ApiProperty({ example: 35, minimum: 0, exclusiveMinimum: true, maximum: 99999999.99, multipleOf: 0.01 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @Max(99999999.99)
  price: number;
}