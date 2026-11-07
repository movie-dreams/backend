import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginationParamsDto } from '../../../../common/dto/pagination-params.dto.js';
import { PaginationResult } from '../../../../common/interfaces/pagination-result.interface.js';
import { MovieRepository } from '../../domain/repositories/movie.repository.js';
import { MovieImage } from '../../domain/entities/movie-image.domain.js';
import { Movie as MovieOrmEntity } from '../entities/movie.orm-entity.js';
import { Movie } from '../../domain/entities/movie.domain.js';
import { MovieImage as MovieImageOrmEntity } from '../entities/movie-image.orm-entity.js';

@Injectable()
export class TypeOrmMovieRepository implements MovieRepository {
  constructor(
    @InjectRepository(MovieOrmEntity)
    private readonly ormRepository: Repository<MovieOrmEntity>,
    @InjectRepository(MovieImageOrmEntity)
    private readonly imageOrmRepository: Repository<MovieImageOrmEntity>,
  ) {}

  async save(movieData: Partial<Movie>): Promise<Movie> {
    const created = this.ormRepository.create(movieData);
    return await this.ormRepository.save(created);
  }

  async findAll(
    params: PaginationParamsDto,
  ): Promise<PaginationResult<Movie>> {
    const [data, total] = await this.ormRepository.findAndCount({
      where: { isActive: true },
      relations: { images: true },
      skip: (params.page - 1) * params.perPage,
      take: params.perPage,
      order: { id: 'ASC' },
    });
    return { data, total };
  }

  async findById(id: number): Promise<Movie | null> {
    return await this.ormRepository.findOne({
      where: { id },
      relations: { images: true },
    });
  }

  async saveMovieImages(
    movieId: number,
    images: Partial<MovieImage>[],
  ): Promise<MovieImage[]> {
    const created = this.imageOrmRepository.create(
      images.map((image) => ({ ...image, movie: { id: movieId } })),
    );
    return await this.imageOrmRepository.save(created);
  }

  async update(id: number, movieData: Partial<Movie>): Promise<Movie | null> {
    const movie = await this.ormRepository.preload({ id, ...movieData });
    if (!movie) return null;
    return await this.ormRepository.save(movie);
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.ormRepository.delete(id);
    return (result.affected ?? 0) > 0;
  }
}