import { Injectable, NotFoundException } from '@nestjs/common';
import { PaginationParamsDto } from '../../../../common/dto/pagination-params.dto.js';
import { PaginationResult } from '../../../../common/interfaces/pagination-result.interface.js';
import { RoleRepository } from '../../domain/repositories/role.repository.js';
import { CreateRoleDto } from '../dto/create-role.dto.js';
import { UpdateRoleDto } from '../dto/update-role.dto.js';
import { Role } from '../../domain/entities/role.domain.js';
import { Transactional } from 'typeorm-transactional';

@Injectable()
export class RoleService {
  constructor(private readonly roleRepository: RoleRepository) {}

  @Transactional()
  async create(dto: CreateRoleDto): Promise<Role> {
    return await this.roleRepository.save(dto);
  }

  async findAll(
    params: PaginationParamsDto,
  ): Promise<PaginationResult<Role>> {
    return await this.roleRepository.findAll(params);
  }

  async findOne(id: number): Promise<Role> {
    const role = await this.roleRepository.findById(id);
    if (!role) {
      throw new NotFoundException(`El rol con ID ${id} no existe`);
    }
    return role;
  }

  async findByName(name: string): Promise<Role> {
    const role = await this.roleRepository.findByName(name);
    if (!role) {
      throw new NotFoundException(`El rol '${name}' no existe`);
    }
    return role;
  }

  @Transactional()
  async update(id: number, dto: UpdateRoleDto): Promise<Role> {
    const updated = await this.roleRepository.update(id, dto);
    if (!updated) {
      throw new NotFoundException(`El rol con ID ${id} no existe`);
    }
    return updated;
  }

  @Transactional()
  async remove(id: number): Promise<void> {
    const deleted = await this.roleRepository.delete(id);
    if (!deleted) {
      throw new NotFoundException(`El rol con ID ${id} no existe`);
    }
  }
}
