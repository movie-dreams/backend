import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MovieService } from './movie.service.js';

vi.mock('typeorm-transactional', () => ({
  Transactional: () =>
    (
      _target: object,
      _propertyKey: string | symbol,
      descriptor: PropertyDescriptor,
    ) => descriptor,
}));
import { Movie } from '../../domain/entities/movie.domain.js';
import { PaginationParamsDto } from '../../../../common/dto/pagination-params.dto.js';
import { PaginationResult } from '../../../../common/interfaces/pagination-result.interface.js';

describe('MovieService', () => {
  let service: MovieService;
  let repository: MovieRepository;

  const mockMovie: Movie = {
    id: 1,
    title: 'Inception',
    durationMinutes: 148,
    isActive: true,
  };

  const paginationParams: PaginationParamsDto = { page: 1, perPage: 10 };

  const mockMovieRepository = {
    save: vi.fn(),
    findAll: vi.fn(),
    findById: vi.fn(),
    saveMovieImages: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  };

  beforeEach(() => {
    repository = mockMovieRepository as unknown as MovieRepository;
    service = new MovieService(repository);
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a movie successfully', async () => {
    mockMovieRepository.save.mockResolvedValue(mockMovie);

    const result = await service.create({
      title: 'Inception',
      durationMinutes: 148,
      isActive: true,
    });

    expect(result).toEqual(mockMovie);
    expect(mockMovieRepository.save).toHaveBeenCalledTimes(1);
  });

  it('should find all movies with pagination', async () => {
    const paginatedResult: PaginationResult<Movie> = {
      items: [mockMovie],
      page: paginationParams.page,
      perPage: paginationParams.perPage,
      totalItems: 1,
      totalPages: 1,
    };
    mockMovieRepository.findAll.mockResolvedValue(paginatedResult);

    const result = await service.findAll(paginationParams);

    expect(result).toEqual(paginatedResult);
    expect(mockMovieRepository.findAll).toHaveBeenCalledWith(paginationParams);
  });

  it('should throw NotFoundException when movie not found', async () => {
    mockMovieRepository.findById.mockResolvedValue(null);

    await expect(service.findOne(999)).rejects.toThrowError(
      'La película con ID 999 no existe',
    );
  });
});
