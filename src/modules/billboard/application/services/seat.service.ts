import { Injectable, NotFoundException } from '@nestjs/common';
import { PaginationParamsDto } from '../../../../common/dto/pagination-params.dto.js';
import { PaginationResult } from '../../../../common/interfaces/pagination-result.interface.js';
import { SeatRepository } from '../../domain/repositories/seat.repository.js';
import { CreateSeatDto } from '../dto/create-seat.dto.js';
import { UpdateSeatDto } from '../dto/update-seat.dto.js';
import { Seat } from '../../domain/entities/seat.domain.js';
import { Transactional } from 'typeorm-transactional';

@Injectable()
export class SeatService {
  constructor(private readonly seatRepository: SeatRepository) {}

  @Transactional()
  async create(dto: CreateSeatDto): Promise<Seat> {
    return await this.seatRepository.save(dto);
  }

  async findAll(
    params: PaginationParamsDto,
  ): Promise<PaginationResult<Seat>> {
    return await this.seatRepository.findAll(params);
  }

  async findOne(id: number): Promise<Seat> {
    const seat = await this.seatRepository.findById(id);
    if (!seat) {
      throw new NotFoundException(`El asiento con ID ${id} no existe`);
    }
    return seat;
  }

  async findByRoom(roomId: number): Promise<Seat[]> {
    return await this.seatRepository.findByRoomId(roomId);
  }

  @Transactional()
  async update(id: number, dto: UpdateSeatDto): Promise<Seat> {
    const updatedSeat = await this.seatRepository.update(id, dto);
    if (!updatedSeat) {
      throw new NotFoundException(`El asiento con ID ${id} no existe`);
    }
    return updatedSeat;
  }

  @Transactional()
  async remove(id: number): Promise<void> {
    const deleted = await this.seatRepository.delete(id);
    if (!deleted) {
      throw new NotFoundException(`El asiento con ID ${id} no existe`);
    }
  }
}
