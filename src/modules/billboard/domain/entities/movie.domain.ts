import { MovieImage } from './movie-image.domain.js';

export class Movie {
  id: number;
  title: string;
  synopsis?: string;
  durationMinutes: number;
  releaseDate?: Date;
  isActive: boolean;
  images?: MovieImage[];
}
