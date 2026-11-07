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
  ApiConflictResponse,
} from '@nestjs/swagger';
import { Auth } from '../../../auth/infrastructure/decorators/auth.decorator.js';
import { Role } from '../../../auth/domain/enums/role.enum.js';
import { HandleException } from '../../../../common/decorators/handle-exception.decorator.js';
import { ApiSuccessResponse } from '../../../../common/decorators/api-success-response.decorator.js';
import { PaginationParamsDto } from '../../../../common/dto/pagination-params.dto.js';
import { PaginatedResponse, SuccessResponse } from '../../../../common/interfaces/custom-response.interface.js';
import { ResponseUtils } from '../../../../common/utils/response.utils.js';
import { RoleService } from '../../application/services/role.service.js';
import { CreateRoleDto } from '../../application/dto/create-role.dto.js';
import { UpdateRoleDto } from '../../application/dto/update-role.dto.js';
import { RoleResponseDto } from '../../application/dto/security-response.dto.js';
import { Role as RoleEntity } from '../../domain/entities/role.domain.js';

@ApiTags('Roles')
@Auth(Role.ADMIN)
@Controller('roles')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear rol' })
  @ApiBody({ type: CreateRoleDto })
  @ApiSuccessResponse(RoleResponseDto, 'Rol creado correctamente', 201)
  @ApiConflictResponse({ description: 'El rol ya existe.' })
  @ApiBadRequestResponse({ description: 'Datos inválidos.' })
  @HandleException('Error al crear el rol')
  async create(@Body() dto: CreateRoleDto): Promise<SuccessResponse<RoleEntity>> {
    const role = await this.roleService.create(dto);
    return ResponseUtils.success(role, 'Rol creado correctamente');
  }

  @Get()
  @ApiOperation({ summary: 'Listar roles' })
  @ApiQuery({ type: PaginationParamsDto })
  @ApiSuccessResponse(RoleResponseDto, 'Lista de roles cargada correctamente', 200, true)
  @HandleException('Error al cargar la lista de roles')
  async findAll(
    @Query() params: PaginationParamsDto,
  ): Promise<PaginatedResponse<RoleEntity>> {
    const { data, total } = await this.roleService.findAll(params);
    return ResponseUtils.paginated(
      data,
      total,
      params.page,
      params.perPage,
      'Lista de roles cargada correctamente',
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un rol por ID' })
  @ApiSuccessResponse(RoleResponseDto, 'Rol encontrado correctamente')
  @ApiNotFoundResponse({ description: 'El rol no existe.' })
  @HandleException('Error al obtener el rol')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<SuccessResponse<RoleEntity>> {
    const role = await this.roleService.findOne(id);
    return ResponseUtils.success(role, 'Rol encontrado correctamente');
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un rol por ID' })
  @ApiBody({ type: UpdateRoleDto })
  @ApiSuccessResponse(RoleResponseDto, 'Rol actualizado correctamente')
  @ApiNotFoundResponse({ description: 'El rol no existe.' })
  @HandleException('Error al actualizar el rol')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateRoleDto,
  ): Promise<SuccessResponse<RoleEntity>> {
    const role = await this.roleService.update(id, dto);
    return ResponseUtils.success(role, 'Rol actualizado correctamente');
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar un rol por ID' })
  @ApiNotFoundResponse({ description: 'El rol no existe.' })
  @HandleException('Error al eliminar el rol')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.roleService.remove(id);
  }
}