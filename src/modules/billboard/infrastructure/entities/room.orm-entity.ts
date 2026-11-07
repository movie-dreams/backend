import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Seat as SeatOrmEntity } from './seat.orm-entity.js';
import { Showtime as ShowtimeOrmEntity } from './showtime.orm-entity.js';

@Entity({ name: 'sala', schema: 'cartelera' })
export class Room {
  @PrimaryGeneratedColumn({ name: 'id_sala' })
  id: number;

  @Column({ name: 'nombre', type: 'varchar', length: 100 })
  name: string;

  @Column({ name: 'capacidad', type: 'int' })
  capacity: number;

  @Column({ name: 'tipo', type: 'varchar', length: 20 })
  type: string;

  @Column({ name: 'activa', type: 'boolean', default: true })
  isActive: boolean;

  @OneToMany(() => SeatOrmEntity, (seat) => seat.room)
  seats: SeatOrmEntity[];

  @OneToMany(() => ShowtimeOrmEntity, (showtime) => showtime.room)
  showtimes: ShowtimeOrmEntity[];
}
