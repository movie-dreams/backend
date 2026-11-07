import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginationParamsDto } from '../../../../common/dto/pagination-params.dto.js';
import { PaginationResult } from '../../../../common/interfaces/pagination-result.interface.js';
import { UserRoleRepository } from '../../domain/repositories/user-role.repository.js';
import { UserRole as UserRoleOrmEntity } from '../entities/user-role.orm-entity.js';
import { UserRole } from '../../domain/entities/user-role.domain.js';

/**
 * Proyección de lectura de una asignación de rol.
 *
 * Excluye deliberadamente la contraseña del usuario relacionado: la API solo
 * expone los datos públicos de la cuenta junto con el rol asignado.
 */
const detailSelection = {
  id: true,
  userId: true,
  roleId: true,
  startDate: true,
  endDate: true,
  status: true,
  user: { id: true, username: true, createdAt: true },
  role: { id: true, name: true },
} as const;

@Injectable()
export class TypeOrmUserRoleRepository implements UserRoleRepository {
  constructor(
    @InjectRepository(UserRoleOrmEntity)
    private readonly ormRepository: Repository<UserRoleOrmEntity>,
  ) {}

  async save(userRoleData: Partial<UserRole>): Promise<UserRole> {
    const created = this.ormRepository.create(userRoleData);
    return await this.ormRepository.save(created);
  }

  async findAll(
    params: PaginationParamsDto,
  ): Promise<PaginationResult<UserRole>> {
    const [data, total] = await this.ormRepository.findAndCount({
      relations: { role: true, user: true },
      select: detailSelection,
      skip: (params.page - 1) * params.perPage,
      take: params.perPage,
      order: { id: 'ASC' },
    });
    return { data, total };
  }

  async findById(id: string): Promise<UserRole | null> {
    return await this.ormRepository.findOne({
      where: { id },
      relations: { role: true, user: true },
      select: detailSelection,
    });
  }

  async findByUserId(userId: number): Promise<UserRole[]> {
    return await this.ormRepository.find({
      where: { userId },
      relations: { role: true },
    });
  }

  async update(id: string, userRoleData: Partial<UserRole>): Promise<UserRole | null> {
    const userRole = await this.ormRepository.preload({ id, ...userRoleData });
    if (!userRole) return null;
    return await this.ormRepository.save(userRole);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.ormRepository.delete(id);
    return (result.affected ?? 0) > 0;
  }
}
