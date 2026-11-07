import { PaginationParamsDto } from '../../../../common/dto/pagination-params.dto.js';
import { PaginationResult } from '../../../../common/interfaces/pagination-result.interface.js';
import { UserRole } from '../entities/user-role.domain.js';

export abstract class UserRoleRepository {
  abstract save(userRole: Partial<UserRole>): Promise<UserRole>;
  abstract findAll(params: PaginationParamsDto): Promise<PaginationResult<UserRole>>;
  abstract findById(id: string): Promise<UserRole | null>;
  abstract findByUserId(userId: number): Promise<UserRole[]>;
  abstract update(id: string, userRoleData: Partial<UserRole>): Promise<UserRole | null>;
  abstract delete(id: string): Promise<boolean>;
}
