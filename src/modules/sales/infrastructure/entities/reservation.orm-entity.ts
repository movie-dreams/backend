import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Showtime as ShowtimeOrmEntity } from '../../../billboard/infrastructure/entities/showtime.orm-entity.js';
import { Client as ClientOrmEntity } from '../../../identity/infrastructure/entities/client.orm-entity.js';
import { ReservationDetail as ReservationDetailOrmEntity } from './reservation-detail.orm-entity.js';

@Entity({ name: 'reserva', schema: 'ventas' })
export class Reservation {
  @PrimaryGeneratedColumn({ name: 'id_reserva' })
  id: number;

  @Column({ name: 'id_cliente' })
  clientId: number;

  @Column({ name: 'id_funcion' })
  showtimeId: number;

  @CreateDateColumn({ name: 'fecha_reserva', type: 'timestamp' })
  reservationDate: Date;

  @Column({ name: 'codigo_reserva', type: 'varchar', length: 20 })
  reservationCode: string;

  @Column({ name: 'estado', type: 'varchar', length: 20 })
  status: string;

  @Column({ name: 'total', type: 'numeric' })
  total: number;

  @ManyToOne(() => ClientOrmEntity)
  @JoinColumn({ name: 'id_cliente' })
  client: ClientOrmEntity;

  @ManyToOne(() => ShowtimeOrmEntity)
  @JoinColumn({ name: 'id_funcion' })
  showtime: ShowtimeOrmEntity;

  @OneToMany(() => ReservationDetailOrmEntity, (detail) => detail.reservation, { cascade: true })
  details: ReservationDetailOrmEntity[];
}
