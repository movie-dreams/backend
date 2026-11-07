import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { PaginationParamsDto } from '../../../../common/dto/pagination-params.dto.js';
import { PaginationResult } from '../../../../common/interfaces/pagination-result.interface.js';
import { SeatRepository } from '../../domain/repositories/seat.repository.js';
import { Seat as SeatOrmEntity } from '../entities/seat.orm-entity.js';
import { Seat } from '../../domain/entities/seat.domain.js';

@Injectable()
export class TypeOrmSeatRepository implements SeatRepository {
  constructor(
    @InjectRepository(SeatOrmEntity)
    private readonly ormRepository: Repository<SeatOrmEntity>,
  ) {}

  async save(seatData: Partial<Seat>): Promise<Seat> {
    const created = this.ormRepository.create(seatData);
    return await this.ormRepository.save(created);
  }

  async findAll(params: PaginationParamsDto): Promise<PaginationResult<Seat>> {
    const [data, total] = await this.ormRepository.findAndCount({
      where: { isActive: true },
      skip: (params.page - 1) * params.perPage,
      take: params.perPage,
      order: { id: 'ASC' },
    });
    return { data, total };
  }

  async findById(id: number): Promise<Seat | null> {
    return await this.ormRepository.findOneBy({ id });
  }

  async findByRoomId(roomId: number): Promise<Seat[]> {
    return await this.ormRepository.find({ where: { roomId, isActive: true } });
  }

  async findActiveByIds(ids: number[]): Promise<Seat[]> {
    return await this.ormRepository.find({
      where: { id: In(ids), isActive: true },
    });
  }

  async findActiveByIdsAndRoom(ids: number[], roomId: number): Promise<Seat[]> {
    return await this.ormRepository.find({
      where: { id: In(ids), roomId, isActive: true },
    });
  }

  async update(id: number, seatData: Partial<Seat>): Promise<Seat | null> {
    const seat = await this.ormRepository.preload({ id, ...seatData });
    if (!seat) return null;
    return await this.ormRepository.save(seat);
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.ormRepository.delete(id);
    return (result.affected ?? 0) > 0;
  }
}
