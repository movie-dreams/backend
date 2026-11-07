import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, type FindOptionsSelect } from 'typeorm';
import { PaginationParamsDto } from '../../../../common/dto/pagination-params.dto.js';
import { PaginationResult } from '../../../../common/interfaces/pagination-result.interface.js';
import { UserRepository } from '../../domain/repositories/user.repository.js';
import { User as UserOrmEntity } from '../entities/user.orm-entity.js';
import { User } from '../../domain/entities/user.domain.js';

/**
 * Datos de la cuenta que se entregan en las consultas: identificador, nombre
 * de usuario y fecha de creación, junto con su persona asociada. La contraseña
 * nunca forma parte de la respuesta (RF-24, RNF-4).
 */
const VISIBLE_USER_SELECT: FindOptionsSelect<UserOrmEntity> = {
  id: true,
  username: true,
  createdAt: true,
  person: {
    id: true,
    firstName: true,
    lastName: true,
    document: true,
    phone: true,
    email: true,
    birthDate: true,
  },
};

@Injectable()
export class TypeOrmUserRepository implements UserRepository {
  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly ormRepository: Repository<UserOrmEntity>,
  ) {}

  async save(userData: Partial<User>): Promise<User> {
    const created = this.ormRepository.create(userData);
    return await this.ormRepository.save(created);
  }

  async findAll(params: PaginationParamsDto): Promise<PaginationResult<User>> {
    const [data, total] = await this.ormRepository.findAndCount({
      select: VISIBLE_USER_SELECT,
      relations: { person: true },
      skip: (params.page - 1) * params.perPage,
      take: params.perPage,
      order: { id: 'ASC' },
    });
    return { data, total };
  }

  async findById(id: number): Promise<User | null> {
    return await this.ormRepository.findOne({
      select: VISIBLE_USER_SELECT,
      where: { id },
      relations: { person: true },
    });
  }

  async findByUsername(username: string): Promise<User | null> {
    return await this.ormRepository.findOne({
      where: { username },
      relations: { person: true },
    });
  }

  async findByUsernameInsensitive(username: string): Promise<User | null> {
    return await this.ormRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.person', 'person')
      .where('LOWER(TRIM(user.username)) = LOWER(TRIM(:username))', {
        username,
      })
      .getOne();
  }

  async update(id: number, userData: Partial<User>): Promise<User | null> {
    const user = await this.ormRepository.preload({ id, ...userData });
    if (!user) return null;
    return await this.ormRepository.save(user);
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.ormRepository.delete(id);
    return (result.affected ?? 0) > 0;
  }
}
