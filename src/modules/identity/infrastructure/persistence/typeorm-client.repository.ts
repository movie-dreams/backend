import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginationParamsDto } from '../../../../common/dto/pagination-params.dto.js';
import { PaginationResult } from '../../../../common/interfaces/pagination-result.interface.js';
import { ClientRepository } from '../../domain/repositories/client.repository.js';
import { Client as ClientOrmEntity } from '../entities/client.orm-entity.js';
import { Client } from '../../domain/entities/client.domain.js';

@Injectable()
export class TypeOrmClientRepository implements ClientRepository {
  constructor(
    @InjectRepository(ClientOrmEntity)
    private readonly ormRepository: Repository<ClientOrmEntity>,
  ) {}

  async save(clientData: Partial<Client>): Promise<Client> {
    const created = this.ormRepository.create(clientData);
    return await this.ormRepository.save(created);
  }

  async findAll(params: PaginationParamsDto): Promise<PaginationResult<Client>> {
    const [data, total] = await this.ormRepository.findAndCount({
      where: { isActive: true },
      relations: { person: true },
      skip: (params.page - 1) * params.perPage,
      take: params.perPage,
      order: { id: 'ASC' },
    });
    return { data, total };
  }

  async findById(id: number): Promise<Client | null> {
    return await this.ormRepository.findOne({
      where: { id },
      relations: { person: true },
    });
  }

  async update(id: number, clientData: Partial<Client>): Promise<Client | null> {
    const client = await this.ormRepository.preload({ id, ...clientData });
    if (!client) return null;
    return await this.ormRepository.save(client);
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.ormRepository.delete(id);
    return (result.affected ?? 0) > 0;
  }
}
