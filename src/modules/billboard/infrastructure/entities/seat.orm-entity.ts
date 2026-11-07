import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  type Relation,
} from 'typeorm';
import { Room as RoomOrmEntity } from './room.orm-entity.js';

@Entity({ name: 'asiento', schema: 'cartelera' })
export class Seat {
  @PrimaryGeneratedColumn({ name: 'id_asiento' })
  id: number;

  @Column({ name: 'id_sala' })
  roomId: number;

  @Column({ name: 'fila', type: 'varchar', length: 20 })
  row: string;

  @Column({ name: 'numero', type: 'int' })
  number: number;

  @Column({ name: 'tipo', type: 'varchar', length: 20 })
  type: string;

  @Column({ name: 'activo', type: 'boolean', default: true })
  isActive: boolean;

  @ManyToOne(() => RoomOrmEntity, (room) => room.seats, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_sala' })
  room: Relation<RoomOrmEntity>;
}
