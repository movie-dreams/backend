import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PaginationParamsDto } from '../../../../common/dto/pagination-params.dto.js';
import { PaginationResult } from '../../../../common/interfaces/pagination-result.interface.js';
import { normalizeIdentifier } from '../../../../common/utils/identifier.utils.js';
import { PersonService } from '../../../identity/application/services/person.service.js';
import { Person } from '../../../identity/domain/entities/person.domain.js';
import { UserRepository } from '../../domain/repositories/user.repository.js';
import { UserRoleRepository } from '../../domain/repositories/user-role.repository.js';
import { CreateUserDto } from '../dto/create-user.dto.js';
import { UpdateUserDto } from '../dto/update-user.dto.js';
import { User } from '../../domain/entities/user.domain.js';
import { Transactional } from 'typeorm-transactional';

const EMAIL_ALREADY_REGISTERED = 'El email ya está registrado.';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly userRoleRepository: UserRoleRepository,
    private readonly personService: PersonService,
  ) {}

  @Transactional()
  async create(dto: CreateUserDto): Promise<User> {
    const email = normalizeIdentifier(dto.email);

    const personWithEmail = await this.personService.findByEmail(email);
    if (personWithEmail) {
      throw new ConflictException(EMAIL_ALREADY_REGISTERED);
    }

    const userWithUsername =
      await this.userRepository.findByUsernameInsensitive(email);
    if (userWithUsername) {
      throw new ConflictException(EMAIL_ALREADY_REGISTERED);
    }

    let person: Person;
    try {
      person = await this.personService.registerAccount({
        email,
        password: dto.password,
      });
    } catch (error: unknown) {
      if (this.isUniqueViolation(error)) {
        throw new ConflictException(EMAIL_ALREADY_REGISTERED);
      }
      throw error;
    }

    const user = await this.userRepository.findById(person.id);
    if (!user) {
      throw new InternalServerErrorException(
        'No se pudo recuperar el usuario creado',
      );
    }

    return this.withoutPassword(user);
  }

  async findAll(
    params: PaginationParamsDto,
  ): Promise<PaginationResult<User>> {
    return await this.userRepository.findAll(params);
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`El usuario con ID ${id} no existe`);
    }
    return user;
  }

  async findByUsername(username: string): Promise<User> {
    const user = await this.userRepository.findByUsername(username);
    if (!user) {
      throw new NotFoundException(`El usuario '${username}' no existe`);
    }
    return user;
  }

  @Transactional()
  async update(id: number, dto: UpdateUserDto): Promise<User> {
    const data = dto.password
      ? { ...dto, password: await bcrypt.hash(dto.password, 10) }
      : dto;
    const updated = await this.userRepository.update(id, data);
    if (!updated) {
      throw new NotFoundException(`El usuario con ID ${id} no existe`);
    }
    return this.withoutPassword(updated);
  }

  @Transactional()
  async remove(id: number): Promise<void> {
    // Role assignments reference the account without cascade deletion, so they
    // must be removed first; otherwise the foreign key rejects the deletion.
    const roleAssignments = await this.userRoleRepository.findByUserId(id);
    for (const roleAssignment of roleAssignments) {
      await this.userRoleRepository.delete(roleAssignment.id);
    }

    const deleted = await this.userRepository.delete(id);
    if (!deleted) {
      throw new NotFoundException(`El usuario con ID ${id} no existe`);
    }
  }

  private withoutPassword(user: User): User {
    return {
      id: user.id,
      username: user.username,
      createdAt: user.createdAt,
    };
  }

  private isUniqueViolation(error: unknown): boolean {
    if (typeof error !== 'object' || error === null) {
      return false;
    }

    const { code, driverError } = error as {
      code?: unknown;
      driverError?: { code?: unknown };
    };

    return code === '23505' || driverError?.code === '23505';
  }
}
