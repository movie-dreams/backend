import { PartialType } from '@nestjs/swagger';
import { CreateReservationDetailDto } from './create-reservation-detail.dto.js';

export class UpdateReservationDetailDto extends PartialType(CreateReservationDetailDto) {}
