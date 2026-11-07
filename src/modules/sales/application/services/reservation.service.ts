import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PaginationParamsDto } from '../../../../common/dto/pagination-params.dto.js';
import { PaginationResult } from '../../../../common/interfaces/pagination-result.interface.js';
import { ShowtimeStatus } from '../../../billboard/domain/enums/showtime-status.enum.js';
import { RoomRepository } from '../../../billboard/domain/repositories/room.repository.js';
import { SeatRepository } from '../../../billboard/domain/repositories/seat.repository.js';
import { ShowtimeRepository } from '../../../billboard/domain/repositories/showtime.repository.js';
import { ReservationDetailRepository } from '../../domain/repositories/reservation-detail.repository.js';
import { ReservationRepository } from '../../domain/repositories/reservation.repository.js';
import { ReservationWithDetails } from '../../domain/repositories/reservation.repository.js';
import { CreateReservationDto } from '../dto/create-reservation.dto.js';
import { UpdateReservationDto } from '../dto/update-reservation.dto.js';
import { Reservation } from '../../domain/entities/reservation.domain.js';
import { Transactional } from 'typeorm-transactional';

@Injectable()
export class ReservationService {
  constructor(
    private readonly reservationRepository: ReservationRepository,
    private readonly reservationDetailRepository: ReservationDetailRepository,
    private readonly showtimeRepository: ShowtimeRepository,
    private readonly roomRepository: RoomRepository,
    private readonly seatRepository: SeatRepository,
  ) {}

  @Transactional()
  async create(dto: CreateReservationDto): Promise<ReservationWithDetails> {
    const repeatedSeatIds = this.findRepeatedSeatIds(
      dto.details.map((detail) => detail.seatId),
    );
    if (repeatedSeatIds.length > 0) {
      throw new BadRequestException(
        `No se puede reservar el mismo asiento más de una vez: ${repeatedSeatIds.join(', ')}`,
      );
    }

    const showtime = await this.showtimeRepository.findByIdForUpdate(
      dto.showtimeId,
    );
    if (!showtime) {
      throw new NotFoundException(`La función con ID ${dto.showtimeId} no existe`);
    }
    if (showtime.status.toUpperCase() === ShowtimeStatus.CANCELADA) {
      throw new BadRequestException('La función no está disponible');
    }

    const room = await this.roomRepository.findById(showtime.roomId);
    if (!room?.isActive) {
      throw new BadRequestException('La sala de la función no está disponible');
    }

    const seatIds = dto.details.map((detail) => detail.seatId);
    const seats = await this.seatRepository.findActiveByIdsAndRoom(
      seatIds,
      showtime.roomId,
    );
    if (seats.length !== seatIds.length) {
      throw new BadRequestException(
        'Los asientos deben estar activos y pertenecer a la sala de la función',
      );
    }

    const occupiedSeatIds =
      await this.reservationDetailRepository.findOccupiedSeatIdsByShowtime(
        showtime.id,
        seatIds,
      );
    if (occupiedSeatIds.length > 0) {
      throw new ConflictException(
        `Los siguientes asientos ya están reservados para esta función: ${occupiedSeatIds.join(', ')}`,
      );
    }

    return await this.reservationRepository.saveWithDetails(dto, dto.details);
  }

  async findAll(
    params: PaginationParamsDto,
  ): Promise<PaginationResult<Reservation>> {
    return await this.reservationRepository.findAll(params);
  }

  async findOne(id: number): Promise<Reservation> {
    const reservation = await this.reservationRepository.findById(id);
    if (!reservation) {
      throw new NotFoundException(`La reserva con ID ${id} no existe`);
    }
    return reservation;
  }

  async findByClient(clientId: number): Promise<Reservation[]> {
    return await this.reservationRepository.findByClientId(clientId);
  }

  @Transactional()
  async update(id: number, dto: UpdateReservationDto): Promise<Reservation> {
    const updated = await this.reservationRepository.update(id, dto);
    if (!updated) {
      throw new NotFoundException(`La reserva con ID ${id} no existe`);
    }
    return updated;
  }

  @Transactional()
  async remove(id: number): Promise<void> {
    const deleted = await this.reservationRepository.delete(id);
    if (!deleted) {
      throw new NotFoundException(`La reserva con ID ${id} no existe`);
    }
  }

  private findRepeatedSeatIds(seatIds: number[]): number[] {
    const duplicates: number[] = [];
    const seen = new Set<number>();

    for (const seatId of seatIds) {
      if (seen.has(seatId)) {
        duplicates.push(seatId);
      }
      seen.add(seatId);
    }

    return [...new Set(duplicates)];
  }
}