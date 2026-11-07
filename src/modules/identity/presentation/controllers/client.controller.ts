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
  ApiNotFoundResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { Auth } from '../../../auth/infrastructure/decorators/auth.decorator.js';
import { Role } from '../../../auth/domain/enums/role.enum.js';
import { HandleException } from '../../../../common/decorators/handle-exception.decorator.js';
import { ApiSuccessResponse } from '../../../../common/decorators/api-success-response.decorator.js';
import { PaginationParamsDto } from '../../../../common/dto/pagination-params.dto.js';
import { PaginatedResponse, SuccessResponse } from '../../../../common/interfaces/custom-response.interface.js';
import { ResponseUtils } from '../../../../common/utils/response.utils.js';
import { ClientService } from '../../application/services/client.service.js';
import { CreateClientDto } from '../../application/dto/create-client.dto.js';
import { UpdateClientDto } from '../../application/dto/update-client.dto.js';
import { ClientResponseDto } from '../../application/dto/client-response.dto.js';
import { Client } from '../../domain/entities/client.domain.js';

@ApiTags('Clientes')
@Controller('clients')
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

  @Post()
  @Auth(Role.ADMIN, Role.MANAGER)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Registrar cliente', description: 'Asocia la persona indicada como cliente.' })
  @ApiBody({ type: CreateClientDto })
  @ApiSuccessResponse(ClientResponseDto, 'Cliente registrado correctamente', 201)
  @ApiBadRequestResponse({ description: 'Datos inválidos.' })
  @HandleException('Error al crear el cliente')
  async create(@Body() dto: CreateClientDto): Promise<SuccessResponse<Client>> {
    const client = await this.clientService.create(dto);
    return ResponseUtils.success(client, 'Cliente registrado correctamente');
  }

  @Get()
  @Auth(Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Listar clientes' })
  @ApiQuery({ type: PaginationParamsDto })
  @ApiSuccessResponse(ClientResponseDto, 'Lista de clientes cargada correctamente', 200, true)
  @HandleException('Error al cargar la lista de clientes')
  async findAll(
    @Query() params: PaginationParamsDto,
  ): Promise<PaginatedResponse<Client>> {
    const { data, total } = await this.clientService.findAll(params);
    return ResponseUtils.paginated(
      data,
      total,
      params.page,
      params.perPage,
      'Lista de clientes cargada correctamente',
    );
  }

  @Get(':id')
  @Auth(Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Obtener un cliente por ID' })
  @ApiSuccessResponse(ClientResponseDto, 'Cliente encontrado correctamente')
  @ApiNotFoundResponse({ description: 'El cliente no existe.' })
  @HandleException('Error al obtener el cliente')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<SuccessResponse<Client>> {
    const client = await this.clientService.findOne(id);
    return ResponseUtils.success(client, 'Cliente encontrado correctamente');
  }

  @Patch(':id')
  @Auth(Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Actualizar un cliente por ID' })
  @ApiBody({ type: UpdateClientDto })
  @ApiSuccessResponse(ClientResponseDto, 'Cliente actualizado correctamente')
  @ApiNotFoundResponse({ description: 'El cliente no existe.' })
  @HandleException('Error al actualizar el cliente')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateClientDto,
  ): Promise<SuccessResponse<Client>> {
    const client = await this.clientService.update(id, dto);
    return ResponseUtils.success(client, 'Cliente actualizado correctamente');
  }

  @Delete(':id')
  @Auth(Role.ADMIN, Role.MANAGER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar un cliente por ID' })
  @ApiNotFoundResponse({ description: 'El cliente no existe.' })
  @HandleException('Error al eliminar el cliente')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.clientService.remove(id);
  }
}