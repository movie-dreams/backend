import { Injectable, NotFoundException } from '@nestjs/common';
import {
  RoomCarteleraDto,
  RoomSummaryDto,
  SeatCarteleraDto,
  ShowtimeCarteleraDto,
} from '../dto/cartelera-response.dto.js';
import { BillboardQueryRepository } from '../../domain/repositories/billboard-query.repository.js';
import { ShowtimeRepository } from '../../domain/repositories/showtime.repository.js';

@Injectable()
export class BillboardService {
  constructor(
    private readonly billboardQueryRepository: BillboardQueryRepository,
    private readonly showtimeRepository: ShowtimeRepository,
  ) {}

  async listRooms(onlyActive?: boolean): Promise<RoomCarteleraDto[]> {
    return await this.billboardQueryRepository.listRooms(onlyActive);
  }

  async roomSummaries(): Promise<RoomSummaryDto[]> {
    return await this.billboardQueryRepository.roomSummaries();
  }

  async listSeats(roomId?: number): Promise<SeatCarteleraDto[]> {
    return await this.billboardQueryRepository.listSeats(roomId);
  }

  async listShowtimes(movieId?: number): Promise<ShowtimeCarteleraDto[]> {
    return await this.billboardQueryRepository.listShowtimes(movieId);
  }

  async seatsByShowtime(showtimeId: number): Promise<SeatCarteleraDto[]> {
    const showtime = await this.showtimeRepository.findById(showtimeId);
    if (!showtime) {
      throw new NotFoundException(
        `La función con ID ${showtimeId} no existe`,
      );
    }
    return await this.billboardQueryRepository.seatsByShowtime(showtimeId);
  }
}