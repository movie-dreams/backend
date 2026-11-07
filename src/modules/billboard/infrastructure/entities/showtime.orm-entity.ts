import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  type Relation,
} from 'typeorm';
import { Movie as MovieOrmEntity } from './movie.orm-entity.js';
import { Room as RoomOrmEntity } from './room.orm-entity.js';

@Entity({ name: 'funcion', schema: 'cartelera' })
export class Showtime {
  @PrimaryGeneratedColumn({ name: 'id_funcion' })
  id: number;

  @Column({ name: 'id_pelicula' })
  movieId: number;

  @Column({ name: 'id_sala' })
  roomId: number;

  @Column({ name: 'fecha', type: 'date' })
  date: Date;

  @Column({ name: 'hora_inicio', type: 'time' })
  startTime: string;

  @Column({ name: 'hora_fin', type: 'time' })
  endTime: string;

  @Column({ name: 'precio', type: 'numeric' })
  price: number;

  @Column({ name: 'estado', type: 'varchar', length: 20 })
  status: string;

  @ManyToOne(() => MovieOrmEntity)
  @JoinColumn({ name: 'id_pelicula' })
  movie: MovieOrmEntity;

  @ManyToOne(() => RoomOrmEntity, (room) => room.showtimes)
  @JoinColumn({ name: 'id_sala' })
  room: Relation<RoomOrmEntity>;
}
