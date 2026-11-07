import { PaginationParamsDto } from '../../../../common/dto/pagination-params.dto.js';
import { PaginationResult } from '../../../../common/interfaces/pagination-result.interface.js';
import { MovieImage } from '../entities/movie-image.domain.js';
import { Movie } from '../entities/movie.domain.js';

export abstract class MovieRepository {
  abstract save(movie: Partial<Movie>): Promise<Movie>;
  abstract findAll(params: PaginationParamsDto): Promise<PaginationResult<Movie>>;
  abstract findById(id: number): Promise<Movie | null>;
  abstract saveMovieImages(
    movieId: number,
    images: Partial<MovieImage>[],
  ): Promise<MovieImage[]>;
  abstract update(id: number, movieData: Partial<Movie>): Promise<Movie | null>;
  abstract delete(id: number): Promise<boolean>;
}