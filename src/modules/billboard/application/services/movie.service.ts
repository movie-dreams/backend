import { Injectable, NotFoundException } from '@nestjs/common';
import { Transactional } from 'typeorm-transactional';
import { PaginationParamsDto } from '../../../../common/dto/pagination-params.dto.js';
import { PaginationResult } from '../../../../common/interfaces/pagination-result.interface.js';
import { MovieRepository } from '../../domain/repositories/movie.repository.js';
import { CreateMovieDto } from '../dto/create-movie.dto.js';
import { UpdateMovieDto } from '../dto/update-movie.dto.js';
import { Movie } from '../../domain/entities/movie.domain.js';

@Injectable()
export class MovieService {
  constructor(private readonly movieRepository: MovieRepository) {}

  @Transactional()
  async create(
    dto: CreateMovieDto,
    files: Express.Multer.File[] = [],
  ): Promise<Movie> {
    const movie = await this.movieRepository.save(dto);

    if (files.length > 0) {
      await this.movieRepository.saveMovieImages(
        movie.id,
        files.map((file) => ({
          fileName: file.filename,
          sizeBytes: file.size,
        })),
      );
    }

    return movie;
  }

  async findAll(
    params: PaginationParamsDto,
  ): Promise<PaginationResult<Movie>> {
    return await this.movieRepository.findAll(params);
  }

  async findOne(id: number): Promise<Movie> {
    const movie = await this.movieRepository.findById(id);
    if (!movie) {
      throw new NotFoundException(`La película con ID ${id} no existe`);
    }
    return movie;
  }

  @Transactional()
  async update(id: number, dto: UpdateMovieDto): Promise<Movie> {
    const updatedMovie = await this.movieRepository.update(id, dto);
    if (!updatedMovie) {
      throw new NotFoundException(`La película con ID ${id} no existe`);
    }
    return updatedMovie;
  }

  @Transactional()
  async remove(id: number): Promise<void> {
    const deleted = await this.movieRepository.delete(id);
    if (!deleted) {
      throw new NotFoundException(`La película con ID ${id} no existe`);
    }
  }
}