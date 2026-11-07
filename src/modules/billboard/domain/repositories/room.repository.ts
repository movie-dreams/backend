import { PaginationParamsDto } from '../../../../common/dto/pagination-params.dto.js';
import { PaginationResult } from '../../../../common/interfaces/pagination-result.interface.js';
import { Room } from '../entities/room.domain.js';

export abstract class RoomRepository {
  abstract save(room: Partial<Room>): Promise<Room>;
  abstract findAll(params: PaginationParamsDto): Promise<PaginationResult<Room>>;
  abstract findById(id: number): Promise<Room | null>;
  abstract findByIdForUpdate(id: number): Promise<Room | null>;
  abstract update(id: number, roomData: Partial<Room>): Promise<Room | null>;
  abstract delete(id: number): Promise<boolean>;
}
