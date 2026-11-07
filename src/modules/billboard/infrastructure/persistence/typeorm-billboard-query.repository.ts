import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
  RoomCarteleraDto,
  RoomSummaryDto,
  SeatCarteleraDto,
  ShowtimeCarteleraDto,
} from '../../application/dto/cartelera-response.dto.js';
import { BillboardQueryRepository } from '../../domain/repositories/billboard-query.repository.js';
import { Room as RoomOrmEntity } from '../entities/room.orm-entity.js';

@Injectable()
export class TypeOrmBillboardQueryRepository
  implements BillboardQueryRepository
{
  constructor(private readonly dataSource: DataSource) {}

  listRooms(onlyActive?: boolean): Promise<RoomCarteleraDto[]> {
    const query = this.dataSource
      .createQueryBuilder(RoomOrmEntity, 's')
      .select('s.id', 'id')
      .addSelect('s.name', 'name')
      .addSelect('s.capacity', 'capacity')
      .addSelect('s.type', 'type')
      .addSelect('s.isActive', 'isActive')
      .orderBy('s.id', 'ASC');

    if (onlyActive) query.where('s.isActive = :activa', { activa: true });

    return query.getRawMany<RoomCarteleraDto>();
  }

  roomSummaries(): Promise<RoomSummaryDto[]> {
    return this.dataSource
      .createQueryBuilder(RoomOrmEntity, 's')
      .leftJoin(
        'cartelera.asiento',
        'a',
        'a.id_sala = s.id',
      )
      .select('s.id', 'id')
      .addSelect('s.name', 'room')
      .addSelect('s.capacity', 'capacity')
      .addSelect('CAST(COUNT(a.id_asiento) AS integer)', 'registeredSeats')
      .groupBy('s.id')
      .addGroupBy('s.name')
      .addGroupBy('s.capacity')
      .orderBy('s.id', 'ASC')
      .getRawMany<RoomSummaryDto>();
  }

  private seatsBaseQuery(roomId?: number) {
    const query = this.dataSource
      .createQueryBuilder()
      .from('cartelera.asiento', 'a')
      .innerJoin('cartelera.sala', 's', 's.id_sala = a.id_sala')
      .select('a.id_asiento', 'id')
      .addSelect('s.id_sala', 'roomId')
      .addSelect('s.nombre', 'room')
      .addSelect('a.fila', 'row')
      .addSelect('a.numero', 'number')
      .addSelect("CONCAT(a.fila, a.numero)", 'seat')
      .addSelect('a.tipo', 'type')
      .addSelect('a.activo', 'isActive');

    if (roomId !== undefined) {
      query.where('s.id_sala = :roomId', { roomId });
    }

    return query
      .orderBy('s.id_sala', 'ASC')
      .addOrderBy('a.fila', 'ASC')
      .addOrderBy('a.numero', 'ASC');
  }

  listSeats(roomId?: number): Promise<SeatCarteleraDto[]> {
    return this.seatsBaseQuery(roomId).getRawMany<SeatCarteleraDto>();
  }

  listShowtimes(movieId?: number): Promise<ShowtimeCarteleraDto[]> {
    const query = this.dataSource
      .createQueryBuilder()
      .from('cartelera.funcion', 'f')
      .innerJoin('cartelera.pelicula', 'p', 'p.id_pelicula = f.id_pelicula')
      .innerJoin('cartelera.sala', 's', 's.id_sala = f.id_sala')
      .select('f.id_funcion', 'id')
      .addSelect('p.id_pelicula', 'movieId')
      .addSelect('p.titulo', 'movie')
      .addSelect('s.id_sala', 'roomId')
      .addSelect('s.nombre', 'room')
      .addSelect('s.tipo', 'roomType')
      .addSelect("CAST(f.fecha AS text)", 'date')
      .addSelect("CAST(f.hora_inicio AS text)", 'startTime')
      .addSelect("CAST(f.hora_fin AS text)", 'endTime')
      .addSelect("CAST(f.precio AS double precision)", 'price')
      .addSelect('f.estado', 'status');

    if (movieId !== undefined) {
      query.where('p.id_pelicula = :movieId', { movieId });
    }

    return query
      .orderBy('f.fecha', 'ASC')
      .addOrderBy('f.hora_inicio', 'ASC')
      .addOrderBy('f.id_funcion', 'ASC')
      .getRawMany<ShowtimeCarteleraDto>();
  }

  seatsByShowtime(showtimeId: number): Promise<SeatCarteleraDto[]> {
    const occupancy = this.dataSource
      .createQueryBuilder()
      .select('1')
      .from('ventas.detalle_reserva', 'dr')
      .innerJoin('ventas.reserva', 'r', 'r.id_reserva = dr.id_reserva')
      .where('dr.id_asiento = a.id_asiento')
      .andWhere('r.id_funcion = f.id_funcion')
      .andWhere("UPPER(r.estado) <> 'CANCELADA'")
      .getQuery();

    const query = this.seatsBaseQuery()
      .innerJoin(
        'cartelera.funcion',
        'f',
        'f.id_sala = s.id_sala',
      )
      .addSelect(
        '(a.activo AND s.activa AND UPPER(f.estado) <> :cancelada AND NOT EXISTS (' +
          occupancy +
          '))',
        'available',
      )
      .where('f.id_funcion = :showtimeId', { showtimeId })
      .setParameter('cancelada', 'CANCELADA');

    return query.getRawMany<SeatCarteleraDto>();
  }
}