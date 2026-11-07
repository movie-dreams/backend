import { PaginationParamsDto } from '../../../../common/dto/pagination-params.dto.js';
import { PaginationResult } from '../../../../common/interfaces/pagination-result.interface.js';
import { Role } from '../entities/role.domain.js';

export abstract class RoleRepository {
  abstract save(role: Partial<Role>): Promise<Role>;
  abstract findAll(params: PaginationParamsDto): Promise<PaginationResult<Role>>;
  abstract findById(id: number): Promise<Role | null>;
  abstract findByName(name: string): Promise<Role | null>;
  abstract update(id: number, roleData: Partial<Role>): Promise<Role | null>;
  abstract delete(id: number): Promise<boolean>;
}
