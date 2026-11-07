import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  type Relation,
} from 'typeorm';
import { MovieImage as MovieImageOrmEntity } from './movie-image.orm-entity.js';

@Entity({ name: 'pelicula', schema: 'cartelera' })
export class Movie {
  @PrimaryGeneratedColumn({ name: 'id_pelicula' })
  id: number;

  @Column({ name: 'titulo', type: 'varchar', length: 100 })
  title: string;

  @Column({ name: 'sinopsis', type: 'text', nullable: true })
  synopsis: string;

  @Column({ name: 'duracion_minutos', type: 'int' })
  durationMinutes: number;

  @Column({ name: 'fecha_estreno', type: 'date', nullable: true })
  releaseDate: Date;

  @Column({ name: 'activo', type: 'boolean', default: true })
  isActive: boolean;

  @OneToMany(() => MovieImageOrmEntity, (image) => image.movie, {
    cascade: true,
  })
  images: Relation<MovieImageOrmEntity[]>;
}
