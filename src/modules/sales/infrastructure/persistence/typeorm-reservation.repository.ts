import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginationParamsDto } from '../../../../common/dto/pagination-params.dto.js';
import { PaginationResult } from '../../../../common/interfaces/pagination-result.interface.js';
import {
  ReservationRepository,
  ReservationWithDetails,
} from '../../domain/repositories/reservation.repository.js';
import { Reservation as ReservationOrmEntity } from '../entities/reservation.orm-entity.js';
import { ReservationDetail as ReservationDetailOrmEntity } from '../entities/reservation-detail.orm-entity.js';
import { Reservation } from '../../domain/entities/reservation.domain.js';
import { ReservationDetail } from '../../domain/entities/reservation-detail.domain.js';

@Injectable()
export class TypeOrmReservationRepository implements ReservationRepository {
  constructor(
    @InjectRepository(ReservationOrmEntity)
    private readonly ormRepository: Repository<ReservationOrmEntity>,
    @InjectRepository(ReservationDetailOrmEntity)
    private readonly detailOrmRepository: Repository<ReservationDetailOrmEntity>,
  ) {}

  async save(reservationData: Partial<Reservation>): Promise<Reservation> {
    const created = this.ormRepository.create(reservationData);
    return await this.ormRepository.save(created);
  }

  async saveWithDetails(
    reservationData: Partial<Reservation>,
    details: { seatId: number; price: number }[],
  ): Promise<ReservationWithDetails> {
    const reservation = this.ormRepository.create({
      ...reservationData,
      details: details.map((detail) =>
        this.detailOrmRepository.create({
          seatId: detail.seatId,
          price: detail.price,
        }),
      ),
    });

    const saved = await this.ormRepository.save(reservation);

    return {
      reservation: saved,
      details: (saved.details as unknown as ReservationDetail[]) ?? [],
    };
  }

  async findAll(
    params: PaginationParamsDto,
  ): Promise<PaginationResult<Reservation>> {
    const [data, total] = await this.ormRepository.findAndCount({
      relations: { client: true, showtime: true, details: true },
      skip: (params.page - 1) * params.perPage,
      take: params.perPage,
      order: { id: 'ASC' },
    });
    return { data, total };
  }

  async findById(id: number): Promise<Reservation | null> {
    return await this.ormRepository.findOne({
      where: { id },
      relations: { client: true, showtime: true, details: true },
    });
  }

  async findByClientId(clientId: number): Promise<Reservation[]> {
    return await this.ormRepository.find({
      where: { clientId },
      relations: { showtime: true, details: true },
    });
  }

  async update(id: number, reservationData: Partial<Reservation>): Promise<Reservation | null> {
    const reservation = await this.ormRepository.preload({ id, ...reservationData });
    if (!reservation) return null;
    return await this.ormRepository.save(reservation);
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.ormRepository.delete(id);
    return (result.affected ?? 0) > 0;
  }
}
