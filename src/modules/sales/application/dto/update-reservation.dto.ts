import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateReservationDto } from './create-reservation.dto.js';

export class UpdateReservationDto extends PartialType(
  OmitType(CreateReservationDto, ['details'] as const),
) {}