import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, ILike, Repository } from 'typeorm';
import { PaginationParamsDto } from '../../../../common/dto/pagination-params.dto.js';
import { PaginationResult } from '../../../../common/interfaces/pagination-result.interface.js';
import {
  PersonRepository,
  PersonSearchCriteria,
} from '../../domain/repositories/person.repository.js';
import { Person as PersonOrmEntity } from '../entities/person.orm-entity.js';
import { Person } from '../../domain/entities/person.domain.js';

@Injectable()
export class TypeOrmPersonRepository implements PersonRepository {
  constructor(
    @InjectRepository(PersonOrmEntity)
    private readonly ormRepository: Repository<PersonOrmEntity>,
  ) {}

  async save(personData: Partial<Person>): Promise<Person> {
    const created = this.ormRepository.create(personData);
    return await this.ormRepository.save(created);
  }

  async findAll(params: PaginationParamsDto): Promise<PaginationResult<Person>> {
    const [data, total] = await this.ormRepository.findAndCount({
      skip: (params.page - 1) * params.perPage,
      take: params.perPage,
      order: { id: 'ASC' },
    });
    return { data, total };
  }

  async search(
    criteria: PersonSearchCriteria,
    params: PaginationParamsDto,
  ): Promise<PaginationResult<Person>> {
    const where: FindOptionsWhere<PersonOrmEntity> = {};
    const pattern = (value: string) =>
      `%${value.replace(/[\\%_]/g, '\\$&')}%`;

    if (criteria.firstName) {
      where.firstName = ILike(pattern(criteria.firstName));
    }
    if (criteria.lastName) {
      where.lastName = ILike(pattern(criteria.lastName));
    }

    const [data, total] = await this.ormRepository.findAndCount({
      where,
      skip: (params.page - 1) * params.perPage,
      take: params.perPage,
      order: { id: 'ASC' },
    });
    return { data, total };
  }

  async findById(id: number): Promise<Person | null> {
    return await this.ormRepository.findOneBy({ id });
  }

  async findByDocument(document: string): Promise<Person | null> {
    return await this.ormRepository.findOneBy({ document });
  }

  async findByEmail(email: string): Promise<Person | null> {
    return await this.ormRepository.findOneBy({ email });
  }

  async findByEmailInsensitive(email: string): Promise<Person | null> {
    return await this.ormRepository
      .createQueryBuilder('person')
      .where('LOWER(TRIM(person.email)) = LOWER(TRIM(:email))', { email })
      .getOne();
  }

  async update(id: number, personData: Partial<Person>): Promise<Person | null> {
    const person = await this.ormRepository.preload({ id, ...personData });
    if (!person) return null;
    return await this.ormRepository.save(person);
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.ormRepository.delete(id);
    return (result.affected ?? 0) > 0;
  }
}
