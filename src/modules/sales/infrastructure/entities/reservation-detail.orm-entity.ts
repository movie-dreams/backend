import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  type Relation,
} from 'typeorm';
import { Seat as SeatOrmEntity } from '../../../billboard/infrastructure/entities/seat.orm-entity.js';
import { Reservation as ReservationOrmEntity } from './reservation.orm-entity.js';

@Entity({ name: 'detalle_reserva', schema: 'ventas' })
export class ReservationDetail {
  @PrimaryGeneratedColumn({ name: 'id_detalle_reserva' })
  id: number;

  @Column({ name: 'id_reserva' })
  reservationId: number;

  @Column({ name: 'id_asiento' })
  seatId: number;

  @Column({ name: 'precio', type: 'numeric' })
  price: number;

  @ManyToOne(() => ReservationOrmEntity, (reservation) => reservation.details, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id_reserva' })
  reservation: Relation<ReservationOrmEntity>;

  @ManyToOne(() => SeatOrmEntity)
  @JoinColumn({ name: 'id_asiento' })
  seat: SeatOrmEntity;
}
