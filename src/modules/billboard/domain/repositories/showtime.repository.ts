import { PaginationParamsDto } from '../../../../common/dto/pagination-params.dto.js';
import { PaginationResult } from '../../../../common/interfaces/pagination-result.interface.js';
import { Showtime } from '../entities/showtime.domain.js';

export abstract class ShowtimeRepository {
  abstract save(showtime: Partial<Showtime>): Promise<Showtime>;
  abstract findAll(params: PaginationParamsDto): Promise<PaginationResult<Showtime>>;
  abstract findById(id: number): Promise<Showtime | null>;
  abstract findByIdForUpdate(id: number): Promise<Showtime | null>;
  abstract findByMovieId(movieId: number): Promise<Showtime[]>;
  abstract existsOverlappingShowtime(
    roomId: number,
    date: string,
    startTime: string,
    endTime: string,
    excludeId?: number,
  ): Promise<boolean>;
  abstract update(id: number, showtimeData: Partial<Showtime>): Promise<Showtime | null>;
  abstract delete(id: number): Promise<boolean>;
}