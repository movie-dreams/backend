import { PaginationParamsDto } from '../../../../common/dto/pagination-params.dto.js';
import { PaginationResult } from '../../../../common/interfaces/pagination-result.interface.js';
import { Client } from '../entities/client.domain.js';

export abstract class ClientRepository {
  abstract save(client: Partial<Client>): Promise<Client>;
  abstract findAll(params: PaginationParamsDto): Promise<PaginationResult<Client>>;
  abstract findById(id: number): Promise<Client | null>;
  abstract update(id: number, clientData: Partial<Client>): Promise<Client | null>;
  abstract delete(id: number): Promise<boolean>;
}
