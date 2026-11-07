import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PaginationParamsDto } from '../../../../common/dto/pagination-params.dto.js';
import { PaginationResult } from '../../../../common/interfaces/pagination-result.interface.js';
import { ShowtimeRepository } from '../../domain/repositories/showtime.repository.js';
import { MovieRepository } from '../../domain/repositories/movie.repository.js';
import { RoomRepository } from '../../domain/repositories/room.repository.js';
import { CreateShowtimeDto } from '../dto/create-showtime.dto.js';
import { UpdateShowtimeDto } from '../dto/update-showtime.dto.js';
import { Showtime } from '../../domain/entities/showtime.domain.js';
import { ShowtimeStatus } from '../../domain/enums/showtime-status.enum.js';
import { Transactional } from 'typeorm-transactional';

@Injectable()
export class ShowtimeService {
  constructor(
    private readonly showtimeRepository: ShowtimeRepository,
    private readonly movieRepository: MovieRepository,
    private readonly roomRepository: RoomRepository,
  ) {}

  @Transactional()
  async create(dto: CreateShowtimeDto): Promise<Showtime> {
    if (dto.endTime <= dto.startTime) {
      throw new BadRequestException(
        'La hora de fin debe ser posterior a la hora de inicio en el mismo día',
      );
    }

    const movie = await this.movieRepository.findById(dto.movieId);
    if (!movie) {
      throw new NotFoundException(
        `La película con ID ${dto.movieId} no existe`,
      );
    }
    if (!movie.isActive) {
      throw new BadRequestException('La película se encuentra inactiva');
    }

    const room = await this.roomRepository.findByIdForUpdate(dto.roomId);
    if (!room) {
      throw new NotFoundException(`La sala con ID ${dto.roomId} no existe`);
    }
    if (!room.isActive) {
      throw new BadRequestException('La sala se encuentra inactiva');
    }

    if (dto.status !== ShowtimeStatus.CANCELADA) {
      const overlapping =
        await this.showtimeRepository.existsOverlappingShowtime(
          dto.roomId,
          dto.date,
          dto.startTime,
          dto.endTime,
        );
      if (overlapping) {
        throw new ConflictException(
          'La sala ya tiene una función en ese horario',
        );
      }
    }

    return await this.showtimeRepository.save({
      ...dto,
      date: new Date(`${dto.date}T00:00:00`),
    });
  }

  async findAll(
    params: PaginationParamsDto,
  ): Promise<PaginationResult<Showtime>> {
    return await this.showtimeRepository.findAll(params);
  }

  async findOne(id: number): Promise<Showtime> {
    const showtime = await this.showtimeRepository.findById(id);
    if (!showtime) {
      throw new NotFoundException(`La función con ID ${id} no existe`);
    }
    return showtime;
  }

  async findByMovie(movieId: number): Promise<Showtime[]> {
    return await this.showtimeRepository.findByMovieId(movieId);
  }

  @Transactional()
  async update(id: number, dto: UpdateShowtimeDto): Promise<Showtime> {
    if (
      dto.endTime !== undefined &&
      dto.startTime !== undefined &&
      dto.endTime <= dto.startTime
    ) {
      throw new BadRequestException(
        'La hora de fin debe ser posterior a la hora de inicio en el mismo día',
      );
    }

    if (dto.status !== ShowtimeStatus.CANCELADA) {
      const base = await this.showtimeRepository.findById(id);
      if (!base) {
        throw new NotFoundException(`La función con ID ${id} no existe`);
      }

      const overlapping =
        await this.showtimeRepository.existsOverlappingShowtime(
          dto.roomId ?? base.roomId,
          dto.date ?? this.formatDate(base.date),
          dto.startTime ?? base.startTime,
          dto.endTime ?? base.endTime,
          id,
        );
      if (overlapping) {
        throw new ConflictException(
          'La sala ya tiene una función en ese horario',
        );
      }
    }

    const { date: _date, ...dtoWithoutDate } = dto;

    const updated = await this.showtimeRepository.update(id, {
      ...dtoWithoutDate,
      ...(dto.date !== undefined
        ? { date: new Date(`${dto.date}T00:00:00`) }
        : {}),
    });
    if (!updated) {
      throw new NotFoundException(`La función con ID ${id} no existe`);
    }
    return updated;
  }

  @Transactional()
  async remove(id: number): Promise<void> {
    const deleted = await this.showtimeRepository.delete(id);
    if (!deleted) {
      throw new NotFoundException(`La función con ID ${id} no existe`);
    }
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}