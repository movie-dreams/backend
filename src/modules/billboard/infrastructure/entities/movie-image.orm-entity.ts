import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  type Relation,
} from 'typeorm';
import { Movie as MovieOrmEntity } from './movie.orm-entity.js';

@Entity({ name: 'imagen_pelicula', schema: 'cartelera' })
export class MovieImage {
  @PrimaryGeneratedColumn({ name: 'id_imagen_pelicula' })
  id: number;

  @Column({ name: 'nombre_archivo', type: 'varchar', length: 255 })
  fileName: string;

  @Column({ name: 'tamano_bytes', type: 'int' })
  sizeBytes: number;

  @Column({ name: 'id_pelicula', type: 'int' })
  movieId: number;

  @ManyToOne(() => MovieOrmEntity, (movie) => movie.images, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id_pelicula' })
  movie: Relation<MovieOrmEntity>;
}