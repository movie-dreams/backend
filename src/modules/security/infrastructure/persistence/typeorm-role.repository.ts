import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginationParamsDto } from '../../../../common/dto/pagination-params.dto.js';
import { PaginationResult } from '../../../../common/interfaces/pagination-result.interface.js';
import { RoleRepository } from '../../domain/repositories/role.repository.js';
import { Role as RoleOrmEntity } from '../entities/role.orm-entity.js';
import { Role } from '../../domain/entities/role.domain.js';

@Injectable()
export class TypeOrmRoleRepository implements RoleRepository {
  constructor(
    @InjectRepository(RoleOrmEntity)
    private readonly ormRepository: Repository<RoleOrmEntity>,
  ) {}

  async save(roleData: Partial<Role>): Promise<Role> {
    const created = this.ormRepository.create(roleData);
    return await this.ormRepository.save(created);
  }

  async findAll(params: PaginationParamsDto): Promise<PaginationResult<Role>> {
    const [data, total] = await this.ormRepository.findAndCount({
      skip: (params.page - 1) * params.perPage,
      take: params.perPage,
      order: { id: 'ASC' },
    });
    return { data, total };
  }

  async findById(id: number): Promise<Role | null> {
    return await this.ormRepository.findOneBy({ id });
  }

  async findByName(name: string): Promise<Role | null> {
    return await this.ormRepository.findOneBy({ name });
  }

  async update(id: number, roleData: Partial<Role>): Promise<Role | null> {
    const role = await this.ormRepository.preload({ id, ...roleData });
    if (!role) return null;
    return await this.ormRepository.save(role);
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.ormRepository.delete(id);
    return (result.affected ?? 0) > 0;
  }
}
