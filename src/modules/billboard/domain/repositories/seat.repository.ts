import { PaginationParamsDto } from '../../../../common/dto/pagination-params.dto.js';
import { PaginationResult } from '../../../../common/interfaces/pagination-result.interface.js';
import { Seat } from '../entities/seat.domain.js';

export abstract class SeatRepository {
  abstract save(seat: Partial<Seat>): Promise<Seat>;
  abstract findAll(params: PaginationParamsDto): Promise<PaginationResult<Seat>>;
  abstract findById(id: number): Promise<Seat | null>;
  abstract findByRoomId(roomId: number): Promise<Seat[]>;
  abstract findActiveByIds(ids: number[]): Promise<Seat[]>;
  abstract findActiveByIdsAndRoom(ids: number[], roomId: number): Promise<Seat[]>;
  abstract update(id: number, seatData: Partial<Seat>): Promise<Seat | null>;
  abstract delete(id: number): Promise<boolean>;
}
