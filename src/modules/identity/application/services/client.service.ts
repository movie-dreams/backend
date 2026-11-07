import { Injectable, NotFoundException } from '@nestjs/common';
import { PaginationParamsDto } from '../../../../common/dto/pagination-params.dto.js';
import { PaginationResult } from '../../../../common/interfaces/pagination-result.interface.js';
import { ClientRepository } from '../../domain/repositories/client.repository.js';
import { CreateClientDto } from '../dto/create-client.dto.js';
import { UpdateClientDto } from '../dto/update-client.dto.js';
import { Client } from '../../domain/entities/client.domain.js';

@Injectable()
export class ClientService {
  constructor(private readonly clientRepository: ClientRepository) {}

  async create(dto: CreateClientDto): Promise<Client> {
    return await this.clientRepository.save(dto);
  }

  async findAll(
    params: PaginationParamsDto,
  ): Promise<PaginationResult<Client>> {
    return await this.clientRepository.findAll(params);
  }

  async findOne(id: number): Promise<Client> {
    const client = await this.clientRepository.findById(id);
    if (!client) {
      throw new NotFoundException(`El cliente con ID ${id} no existe`);
    }
    return client;
  }

  async update(id: number, dto: UpdateClientDto): Promise<Client> {
    const updatedClient = await this.clientRepository.update(id, dto);
    if (!updatedClient) {
      throw new NotFoundException(`El cliente con ID ${id} no existe`);
    }
    return updatedClient;
  }

  async remove(id: number): Promise<void> {
    const deleted = await this.clientRepository.delete(id);
    if (!deleted) {
      throw new NotFoundException(`El cliente con ID ${id} no existe`);
    }
  }
}