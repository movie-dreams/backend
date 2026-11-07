import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class MovieImageResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'pelicula-550e8400-e29b-41d4-a716-446655440000.jpg' })
  fileName: string;

  @ApiProperty({ example: 24576 })
  sizeBytes: number;

  @ApiProperty({ example: 1 })
  movieId: number;
}

export class MovieResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Interstellar' })
  title: string;

  @ApiPropertyOptional({ example: 'Un grupo de exploradores viaja a través de un agujero de gusano.' })
  synopsis?: string;

  @ApiProperty({ example: 169 })
  durationMinutes: number;

  @ApiPropertyOptional({ example: '2026-09-16' })
  releaseDate?: Date;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiPropertyOptional({ type: [MovieImageResponseDto] })
  images?: MovieImageResponseDto[];
}

export class MovieListedDto extends MovieResponseDto {}