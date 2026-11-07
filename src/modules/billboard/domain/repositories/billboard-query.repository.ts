import {
  RoomCarteleraDto,
  RoomSummaryDto,
  SeatCarteleraDto,
  ShowtimeCarteleraDto,
} from '../../application/dto/cartelera-response.dto.js';

export abstract class BillboardQueryRepository {
  abstract listRooms(onlyActive?: boolean): Promise<RoomCarteleraDto[]>;
  abstract roomSummaries(): Promise<RoomSummaryDto[]>;
  abstract listSeats(roomId?: number): Promise<SeatCarteleraDto[]>;
  abstract listShowtimes(movieId?: number): Promise<ShowtimeCarteleraDto[]>;
  abstract seatsByShowtime(showtimeId: number): Promise<SeatCarteleraDto[]>;
}