import { Injectable, NotFoundException } from '@nestjs/common';
import { PaginationParamsDto } from '../../../../common/dto/pagination-params.dto.js';
import { PaginationResult } from '../../../../common/interfaces/pagination-result.interface.js';
import { RoomRepository } from '../../domain/repositories/room.repository.js';
import { CreateRoomDto } from '../dto/create-room.dto.js';
import { UpdateRoomDto } from '../dto/update-room.dto.js';
import { Room } from '../../domain/entities/room.domain.js';
import { Transactional } from 'typeorm-transactional';

@Injectable()
export class RoomService {
  constructor(private readonly roomRepository: RoomRepository) {}

  @Transactional()
  async create(dto: CreateRoomDto): Promise<Room> {
    return await this.roomRepository.save(dto);
  }

  async findAll(
    params: PaginationParamsDto,
  ): Promise<PaginationResult<Room>> {
    return await this.roomRepository.findAll(params);
  }

  async findOne(id: number): Promise<Room> {
    const room = await this.roomRepository.findById(id);
    if (!room) {
      throw new NotFoundException(`La sala con ID ${id} no existe`);
    }
    return room;
  }

  @Transactional()
  async update(id: number, dto: UpdateRoomDto): Promise<Room> {
    const updatedRoom = await this.roomRepository.update(id, dto);
    if (!updatedRoom) {
      throw new NotFoundException(`La sala con ID ${id} no existe`);
    }
    return updatedRoom;
  }

  @Transactional()
  async remove(id: number): Promise<void> {
    const deleted = await this.roomRepository.delete(id);
    if (!deleted) {
      throw new NotFoundException(`La sala con ID ${id} no existe`);
    }
  }
}
