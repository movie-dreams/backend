import { PaginationParamsDto } from '../../../../common/dto/pagination-params.dto.js';
import { PaginationResult } from '../../../../common/interfaces/pagination-result.interface.js';
import { Reservation } from '../entities/reservation.domain.js';
import { ReservationDetail } from '../entities/reservation-detail.domain.js';

export interface ReservationWithDetails {
  reservation: Reservation;
  details: ReservationDetail[];
}

export abstract class ReservationRepository {
  abstract save(reservation: Partial<Reservation>): Promise<Reservation>;
  abstract saveWithDetails(
    reservationData: Partial<Reservation>,
    details: { seatId: number; price: number }[],
  ): Promise<ReservationWithDetails>;
  abstract findAll(params: PaginationParamsDto): Promise<PaginationResult<Reservation>>;
  abstract findById(id: number): Promise<Reservation | null>;
  abstract findByClientId(clientId: number): Promise<Reservation[]>;
  abstract update(id: number, reservationData: Partial<Reservation>): Promise<Reservation | null>;
  abstract delete(id: number): Promise<boolean>;
}
