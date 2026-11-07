import { Injectable, NotFoundException } from '@nestjs/common';
import { PaginationParamsDto } from '../../../../common/dto/pagination-params.dto.js';
import { PaginationResult } from '../../../../common/interfaces/pagination-result.interface.js';
import { ReservationDetailRepository } from '../../domain/repositories/reservation-detail.repository.js';
import { CreateReservationDetailDto } from '../dto/create-reservation-detail.dto.js';
import { UpdateReservationDetailDto } from '../dto/update-reservation-detail.dto.js';
import { ReservationDetail } from '../../domain/entities/reservation-detail.domain.js';
import { Transactional } from 'typeorm-transactional';

@Injectable()
export class ReservationDetailService {
  constructor(private readonly detailRepository: ReservationDetailRepository) {}

  @Transactional()
  async create(dto: CreateReservationDetailDto): Promise<ReservationDetail> {
    return await this.detailRepository.save(dto);
  }

  async findAll(
    params: PaginationParamsDto,
  ): Promise<PaginationResult<ReservationDetail>> {
    return await this.detailRepository.findAll(params);
  }

  async findOne(id: number): Promise<ReservationDetail> {
    const detail = await this.detailRepository.findById(id);
    if (!detail) {
      throw new NotFoundException(`El detalle de reserva con ID ${id} no existe`);
    }
    return detail;
  }

  async findByReservation(reservationId: number): Promise<ReservationDetail[]> {
    return await this.detailRepository.findByReservationId(reservationId);
  }

  @Transactional()
  async update(id: number, dto: UpdateReservationDetailDto): Promise<ReservationDetail> {
    const updated = await this.detailRepository.update(id, dto);
    if (!updated) {
      throw new NotFoundException(`El detalle de reserva con ID ${id} no existe`);
    }
    return updated;
  }

  @Transactional()
  async remove(id: number): Promise<void> {
    const deleted = await this.detailRepository.delete(id);
    if (!deleted) {
      throw new NotFoundException(`El detalle de reserva con ID ${id} no existe`);
    }
  }
}
