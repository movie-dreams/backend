import { PaginationParamsDto } from '../../../../common/dto/pagination-params.dto.js';
import { PaginationResult } from '../../../../common/interfaces/pagination-result.interface.js';
import { User } from '../entities/user.domain.js';

export abstract class UserRepository {
  abstract save(user: Partial<User>): Promise<User>;
  abstract findAll(params: PaginationParamsDto): Promise<PaginationResult<User>>;
  abstract findById(id: number): Promise<User | null>;
  abstract findByUsername(username: string): Promise<User | null>;
  abstract findByUsernameInsensitive(username: string): Promise<User | null>;
  abstract update(id: number, userData: Partial<User>): Promise<User | null>;
  abstract delete(id: number): Promise<boolean>;
}
