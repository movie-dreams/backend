import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginationParamsDto } from '../../../../common/dto/pagination-params.dto.js';
import { PaginationResult } from '../../../../common/interfaces/pagination-result.interface.js';
import { ShowtimeRepository } from '../../domain/repositories/showtime.repository.js';
import { Showtime as ShowtimeOrmEntity } from '../entities/showtime.orm-entity.js';
import { Showtime } from '../../domain/entities/showtime.domain.js';

@Injectable()
export class TypeOrmShowtimeRepository implements ShowtimeRepository {
  constructor(
    @InjectRepository(ShowtimeOrmEntity)
    private readonly ormRepository: Repository<ShowtimeOrmEntity>,
  ) {}

  async save(showtimeData: Partial<Showtime>): Promise<Showtime> {
    const created = this.ormRepository.create(showtimeData);
    return await this.ormRepository.save(created);
  }

  async findAll(
    params: PaginationParamsDto,
  ): Promise<PaginationResult<Showtime>> {
    const [data, total] = await this.ormRepository.findAndCount({
      relations: { movie: true, room: true },
      skip: (params.page - 1) * params.perPage,
      take: params.perPage,
      order: { id: 'ASC' },
    });
    return { data, total };
  }

  async findById(id: number): Promise<Showtime | null> {
    return await this.ormRepository.findOne({
      where: { id },
      relations: { movie: true, room: true },
    });
  }

  async findByIdForUpdate(id: number): Promise<Showtime | null> {
    return await this.ormRepository.findOne({
      where: { id },
      lock: { mode: 'pessimistic_write' },
    });
  }

  async findByMovieId(movieId: number): Promise<Showtime[]> {
    return await this.ormRepository.find({
      where: { movieId },
      relations: { room: true },
    });
  }

  async existsOverlappingShowtime(
    roomId: number,
    date: string,
    startTime: string,
    endTime: string,
    excludeId?: number,
  ): Promise<boolean> {
    const query = this.ormRepository
      .createQueryBuilder('f')
      .where('f.roomId = :roomId', { roomId })
      .andWhere('f.date = :date', { date })
      .andWhere('f.status <> :cancelada', { cancelada: 'CANCELADA' })
      .andWhere('f.startTime < :fin AND f.endTime > :inicio', {
        fin: endTime,
        inicio: startTime,
      });

    if (excludeId !== undefined) {
      query.andWhere('f.id <> :excludeId', { excludeId });
    }

    return await query.getExists();
  }

  async update(id: number, showtimeData: Partial<Showtime>): Promise<Showtime | null> {
    const showtime = await this.ormRepository.preload({ id, ...showtimeData });
    if (!showtime) return null;
    return await this.ormRepository.save(showtime);
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.ormRepository.delete(id);
    return (result.affected ?? 0) > 0;
  }
}
