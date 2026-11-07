import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginationParamsDto } from '../../../../common/dto/pagination-params.dto.js';
import { PaginationResult } from '../../../../common/interfaces/pagination-result.interface.js';
import { RoomRepository } from '../../domain/repositories/room.repository.js';
import { Room as RoomOrmEntity } from '../entities/room.orm-entity.js';
import { Room } from '../../domain/entities/room.domain.js';

@Injectable()
export class TypeOrmRoomRepository implements RoomRepository {
  constructor(
    @InjectRepository(RoomOrmEntity)
    private readonly ormRepository: Repository<RoomOrmEntity>,
  ) {}

  async save(roomData: Partial<Room>): Promise<Room> {
    const created = this.ormRepository.create(roomData);
    return await this.ormRepository.save(created);
  }

  async findAll(params: PaginationParamsDto): Promise<PaginationResult<Room>> {
    const [data, total] = await this.ormRepository.findAndCount({
      where: { isActive: true },
      skip: (params.page - 1) * params.perPage,
      take: params.perPage,
      order: { id: 'ASC' },
    });
    return { data, total };
  }

  async findById(id: number): Promise<Room | null> {
    return await this.ormRepository.findOneBy({ id });
  }

  async findByIdForUpdate(id: number): Promise<Room | null> {
    return await this.ormRepository.findOne({
      where: { id },
      lock: { mode: 'pessimistic_write' },
    });
  }

  async update(id: number, roomData: Partial<Room>): Promise<Room | null> {
    const room = await this.ormRepository.preload({ id, ...roomData });
    if (!room) return null;
    return await this.ormRepository.save(room);
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.ormRepository.delete(id);
    return (result.affected ?? 0) > 0;
  }
}
