import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginationParamsDto } from '../../../../common/dto/pagination-params.dto.js';
import { PaginationResult } from '../../../../common/interfaces/pagination-result.interface.js';
import { ReservationDetailRepository } from '../../domain/repositories/reservation-detail.repository.js';
import { ReservationDetail as ReservationDetailOrmEntity } from '../entities/reservation-detail.orm-entity.js';
import { ReservationDetail } from '../../domain/entities/reservation-detail.domain.js';

@Injectable()
export class TypeOrmReservationDetailRepository implements ReservationDetailRepository {
  constructor(
    @InjectRepository(ReservationDetailOrmEntity)
    private readonly ormRepository: Repository<ReservationDetailOrmEntity>,
  ) {}

  async save(detailData: Partial<ReservationDetail>): Promise<ReservationDetail> {
    const created = this.ormRepository.create(detailData);
    return await this.ormRepository.save(created);
  }

  async findAll(
    params: PaginationParamsDto,
  ): Promise<PaginationResult<ReservationDetail>> {
    const [data, total] = await this.ormRepository.findAndCount({
      relations: { seat: true },
      skip: (params.page - 1) * params.perPage,
      take: params.perPage,
      order: { id: 'ASC' },
    });
    return { data, total };
  }

  async findById(id: number): Promise<ReservationDetail | null> {
    return await this.ormRepository.findOne({
      where: { id },
      relations: { seat: true },
    });
  }

  async findByReservationId(reservationId: number): Promise<ReservationDetail[]> {
    return await this.ormRepository.find({
      where: { reservationId },
      relations: { seat: true },
    });
  }

  async findOccupiedSeatIdsByShowtime(
    showtimeId: number,
    seatIds: number[],
  ): Promise<number[]> {
    if (seatIds.length === 0) return [];

    const rows = await this.ormRepository
      .createQueryBuilder('d')
      .innerJoin('d.reservation', 'r')
      .select('d.seatId', 'seatId')
      .where('r.showtimeId = :showtimeId', { showtimeId })
      .andWhere('r.status <> :cancelada', { cancelada: 'CANCELADA' })
      .andWhere('d.seatId IN (:...seatIds)', { seatIds })
      .getRawMany<{ seatId: number }>();

    return rows.map((row) => row.seatId);
  }

  async update(id: number, detailData: Partial<ReservationDetail>): Promise<ReservationDetail | null> {
    const detail = await this.ormRepository.preload({ id, ...detailData });
    if (!detail) return null;
    return await this.ormRepository.save(detail);
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.ormRepository.delete(id);
    return (result.affected ?? 0) > 0;
  }
}
