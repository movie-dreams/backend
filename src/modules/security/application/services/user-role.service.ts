import { Injectable, NotFoundException } from '@nestjs/common';
import { PaginationParamsDto } from '../../../../common/dto/pagination-params.dto.js';
import { PaginationResult } from '../../../../common/interfaces/pagination-result.interface.js';
import { UserRoleRepository } from '../../domain/repositories/user-role.repository.js';
import { CreateUserRoleDto } from '../dto/create-user-role.dto.js';
import { UpdateUserRoleDto } from '../dto/update-user-role.dto.js';
import { UserRole } from '../../domain/entities/user-role.domain.js';
import { Transactional } from 'typeorm-transactional';

@Injectable()
export class UserRoleService {
  constructor(private readonly userRoleRepository: UserRoleRepository) {}

  @Transactional()
  async create(dto: CreateUserRoleDto): Promise<UserRole> {
    return await this.userRoleRepository.save(dto);
  }

  async findAll(
    params: PaginationParamsDto,
  ): Promise<PaginationResult<UserRole>> {
    return await this.userRoleRepository.findAll(params);
  }

  async findOne(id: string): Promise<UserRole> {
    const userRole = await this.userRoleRepository.findById(id);
    if (!userRole) {
      throw new NotFoundException(`La asignación de rol con ID ${id} no existe`);
    }
    return userRole;
  }

  async findByUser(userId: number): Promise<UserRole[]> {
    return await this.userRoleRepository.findByUserId(userId);
  }

  @Transactional()
  async update(id: string, dto: UpdateUserRoleDto): Promise<UserRole> {
    const updated = await this.userRoleRepository.update(id, dto);
    if (!updated) {
      throw new NotFoundException(`La asignación de rol con ID ${id} no existe`);
    }
    return updated;
  }

  @Transactional()
  async remove(id: string): Promise<void> {
    const deleted = await this.userRoleRepository.delete(id);
    if (!deleted) {
      throw new NotFoundException(`La asignación de rol con ID ${id} no existe`);
    }
  }
}
