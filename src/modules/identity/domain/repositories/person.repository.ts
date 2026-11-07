import { PaginationParamsDto } from '../../../../common/dto/pagination-params.dto.js';
import { PaginationResult } from '../../../../common/interfaces/pagination-result.interface.js';
import { Person } from '../entities/person.domain.js';

export interface PersonSearchCriteria {
  firstName?: string;
  lastName?: string;
}

export abstract class PersonRepository {
  abstract save(person: Partial<Person>): Promise<Person>;
  abstract findAll(params: PaginationParamsDto): Promise<PaginationResult<Person>>;
  abstract search(
    criteria: PersonSearchCriteria,
    params: PaginationParamsDto,
  ): Promise<PaginationResult<Person>>;
  abstract findById(id: number): Promise<Person | null>;
  abstract findByDocument(document: string): Promise<Person | null>;
  abstract findByEmail(email: string): Promise<Person | null>;
  abstract findByEmailInsensitive(email: string): Promise<Person | null>;
  abstract update(id: number, personData: Partial<Person>): Promise<Person | null>;
  abstract delete(id: number): Promise<boolean>;
}
