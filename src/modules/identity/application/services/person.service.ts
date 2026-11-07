import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Transactional } from 'typeorm-transactional';
import { AuthService } from '../../../auth/application/services/auth.service.js';
import { Role } from '../../../auth/domain/enums/role.enum.js';
import { PaginationParamsDto } from '../../../../common/dto/pagination-params.dto.js';
import { PaginationResult } from '../../../../common/interfaces/pagination-result.interface.js';
import { ClientRepository } from '../../domain/repositories/client.repository.js';
import { PersonRepository } from '../../domain/repositories/person.repository.js';
import { CreatePersonDto } from '../dto/create-person.dto.js';
import { UpdatePersonDto } from '../dto/update-person.dto.js';
import { SearchPersonDto } from '../dto/search-person.dto.js';
import { Person } from '../../domain/entities/person.domain.js';
import { normalizeIdentifier } from '../../../../common/utils/identifier.utils.js';

export interface RegisterAccountInput {
  email: string;
  password: string;
}

@Injectable()
export class PersonService {
  constructor(
    private readonly personRepository: PersonRepository,
    private readonly clientRepository: ClientRepository,
    private readonly authService: AuthService,
  ) {}

  @Transactional()
  async register(dto: CreatePersonDto): Promise<Person> {
    const person = await this.personRepository.save(dto);

    await this.clientRepository.save({
      id: person.id,
      isActive: true,
    });

    if (dto.username && dto.password) {
      await this.authService.registerUserWithRole(
        {
          personId: person.id,
          username: dto.username,
          password: dto.password,
        },
        Role.CLIENT,
      );
    }

    return person;
  }

  /**
   * Alta conjunta de una cuenta de cliente: crea la persona con solo su email,
   * el registro de cliente activo del titular y la cuenta con el email como
   * nombre de usuario y el rol 'Cliente' activo. Método aditivo: no altera
   * `register`.
   */
  @Transactional()
  async registerAccount(payload: RegisterAccountInput): Promise<Person> {
    const email = normalizeIdentifier(payload.email);

    const person = await this.personRepository.save({ email });

    await this.clientRepository.save({
      id: person.id,
      isActive: true,
    });

    await this.authService.registerUserWithRole(
      {
        personId: person.id,
        username: email,
        password: payload.password,
      },
      Role.CLIENT,
    );

    return person;
  }

  /**
   * Busca una persona por su email, comparando sin distinguir mayúsculas ni
   * espacios. Devuelve `null` cuando no existe.
   */
  async findByEmail(email: string): Promise<Person | null> {
    return await this.personRepository.findByEmailInsensitive(
      normalizeIdentifier(email),
    );
  }

  async findAll(
    params: PaginationParamsDto,
  ): Promise<PaginationResult<Person>> {
    return await this.personRepository.findAll(params);
  }

  async search(dto: SearchPersonDto): Promise<PaginationResult<Person>> {
    if (!dto.firstName && !dto.lastName) {
      throw new BadRequestException(
        'Debe enviar nombres o apellidos para realizar la búsqueda',
      );
    }

    return await this.personRepository.search(
      {
        firstName: dto.firstName,
        lastName: dto.lastName,
      },
      dto,
    );
  }

  async findOne(id: number): Promise<Person> {
    const person = await this.personRepository.findById(id);
    if (!person) {
      throw new NotFoundException(`La persona con ID ${id} no existe`);
    }
    return person;
  }

  async update(id: number, dto: UpdatePersonDto): Promise<Person> {
    const updatedPerson = await this.personRepository.update(id, dto);
    if (!updatedPerson) {
      throw new NotFoundException(`La persona con ID ${id} no existe`);
    }
    return updatedPerson;
  }

  async remove(id: number): Promise<void> {
    const deleted = await this.personRepository.delete(id);
    if (!deleted) {
      throw new NotFoundException(`La persona con ID ${id} no existe`);
    }
  }
}