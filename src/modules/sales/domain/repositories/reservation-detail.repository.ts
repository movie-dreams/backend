import { PaginationParamsDto } from '../../../../common/dto/pagination-params.dto.js';
import { PaginationResult } from '../../../../common/interfaces/pagination-result.interface.js';
import { ReservationDetail } from '../entities/reservation-detail.domain.js';

export abstract class ReservationDetailRepository {
  abstract save(detail: Partial<ReservationDetail>): Promise<ReservationDetail>;
  abstract findAll(params: PaginationParamsDto): Promise<PaginationResult<ReservationDetail>>;
  abstract findById(id: number): Promise<ReservationDetail | null>;
  abstract findByReservationId(reservationId: number): Promise<ReservationDetail[]>;
  abstract findOccupiedSeatIdsByShowtime(showtimeId: number, seatIds: number[]): Promise<number[]>;
  abstract update(id: number, detailData: Partial<ReservationDetail>): Promise<ReservationDetail | null>;
  abstract delete(id: number): Promise<boolean>;
}
