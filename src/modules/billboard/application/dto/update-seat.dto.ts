import { PartialType } from '@nestjs/swagger';
import { CreateSeatDto } from './create-seat.dto.js';

export class UpdateSeatDto extends PartialType(CreateSeatDto) {}
