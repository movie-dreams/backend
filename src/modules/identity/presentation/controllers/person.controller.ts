import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiQuery,
  ApiBody,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { Auth } from '../../../auth/infrastructure/decorators/auth.decorator.js';
import { Role } from '../../../auth/domain/enums/role.enum.js';
import { HandleException } from '../../../../common/decorators/handle-exception.decorator.js';
import { ApiSuccessResponse } from '../../../../common/decorators/api-success-response.decorator.js';
import { PaginationParamsDto } from '../../../../common/dto/pagination-params.dto.js';
import { PaginatedResponse, SuccessResponse } from '../../../../common/interfaces/custom-response.interface.js';
import { ResponseUtils } from '../../../../common/utils/response.utils.js';
import { PersonService } from '../../application/services/person.service.js';
import { CreatePersonDto } from '../../application/dto/create-person.dto.js';
import { UpdatePersonDto } from '../../application/dto/update-person.dto.js';
import { SearchPersonDto } from '../../application/dto/search-person.dto.js';
import { Person } from '../../domain/entities/person.domain.js';

@ApiTags('Personas')
@Controller('persons')
export class PersonController {
  constructor(private readonly personService: PersonService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Registrar persona', description: 'Registra la persona, su cliente asociado y, si se envían username/password, su usuario de acceso.' })
  @ApiBody({ type: CreatePersonDto })
  @ApiSuccessResponse(Person, 'Persona registrada correctamente', 201)
  @ApiBadRequestResponse({ description: 'Datos inválidos o usuario duplicado.' })
  @HandleException('Error al registrar la persona')
  async create(@Body() dto: CreatePersonDto): Promise<SuccessResponse<Person>> {
    const person = await this.personService.register(dto);
    return ResponseUtils.success(person, 'Persona registrada correctamente');
  }

  @Get()
  @Auth(Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Listar personas' })
  @ApiQuery({ type: PaginationParamsDto })
  @ApiSuccessResponse(Person, 'Lista de personas cargada correctamente', 200, true)
  @HandleException('Error al cargar la lista de personas')
  async findAll(
    @Query() params: PaginationParamsDto,
  ): Promise<PaginatedResponse<Person>> {
    const { data, total } = await this.personService.findAll(params);
    return ResponseUtils.paginated(
      data,
      total,
      params.page,
      params.perPage,
      'Lista de personas cargada correctamente',
    );
  }

  @Get('search')
  @Auth(Role.ADMIN, Role.MANAGER)
  @ApiOperation({
    summary: 'Buscar personas por nombres y apellidos',
    description:
      'Requiere nombres o apellidos. Busca coincidencias parciales sin distinguir mayúsculas; si envía ambos, deben coincidir ambos. Requiere ADMIN o MANAGER. Sin coincidencias devuelve una lista vacía.',
  })
  @ApiQuery({ type: SearchPersonDto })
  @ApiSuccessResponse(Person, 'Búsqueda de personas realizada correctamente', 200, true)
  @ApiBadRequestResponse({ description: 'Filtros ausentes, vacíos o paginación inválida.' })
  @HandleException('Error al buscar personas')
  async search(
    @Query() dto: SearchPersonDto,
  ): Promise<PaginatedResponse<Person>> {
    const { data, total } = await this.personService.search(dto);
    return ResponseUtils.paginated(
      data,
      total,
      dto.page,
      dto.perPage,
      'Búsqueda de personas realizada correctamente',
    );
  }

  @Get(':id')
  @Auth(Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Obtener una persona por ID' })
  @ApiSuccessResponse(Person, 'Persona encontrada correctamente')
  @ApiNotFoundResponse({ description: 'La persona no existe.' })
  @HandleException('Error al obtener la persona')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<SuccessResponse<Person>> {
    const person = await this.personService.findOne(id);
    return ResponseUtils.success(person, 'Persona encontrada correctamente');
  }

  @Patch(':id')
  @Auth(Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Actualizar una persona por ID' })
  @ApiBody({ type: UpdatePersonDto })
  @ApiSuccessResponse(Person, 'Persona actualizada correctamente')
  @ApiNotFoundResponse({ description: 'La persona no existe.' })
  @HandleException('Error al actualizar la persona')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePersonDto,
  ): Promise<SuccessResponse<Person>> {
    const person = await this.personService.update(id, dto);
    return ResponseUtils.success(person, 'Persona actualizada correctamente');
  }

  @Delete(':id')
  @Auth(Role.ADMIN, Role.MANAGER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar una persona por ID' })
  @ApiNotFoundResponse({ description: 'La persona no existe.' })
  @HandleException('Error al eliminar la persona')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.personService.remove(id);
  }
}