import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
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
import { UserRoleService } from '../../application/services/user-role.service.js';
import { CreateUserRoleDto } from '../../application/dto/create-user-role.dto.js';
import { UpdateUserRoleDto } from '../../application/dto/update-user-role.dto.js';
import { UserRoleResponseDto } from '../../application/dto/security-response.dto.js';
import { UserRole } from '../../domain/entities/user-role.domain.js';

@ApiTags('Asignaciones de Rol')
@Auth(Role.ADMIN)
@Controller('user-roles')
export class UserRoleController {
  constructor(private readonly userRoleService: UserRoleService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Asignar rol a un usuario' })
  @ApiBody({ type: CreateUserRoleDto })
  @ApiSuccessResponse(UserRoleResponseDto, 'Rol asignado correctamente', 201)
  @ApiConflictResponse({ description: 'El usuario ya tiene asignado ese rol.' })
  @ApiBadRequestResponse({ description: 'Datos inválidos.' })
  @HandleException('Error al asignar el rol al usuario')
  async create(
    @Body() dto: CreateUserRoleDto,
  ): Promise<SuccessResponse<UserRole>> {
    const userRole = await this.userRoleService.create(dto);
    return ResponseUtils.success(userRole, 'Rol asignado correctamente');
  }

  @Get()
  @ApiOperation({ summary: 'Listar asignaciones de rol', description: 'Opcionalmente filtradas por usuario.' })
  @ApiQuery({ type: PaginationParamsDto })
  @ApiQuery({ name: 'userId', required: false, type: Number, description: 'ID del usuario' })
  @ApiSuccessResponse(UserRoleResponseDto, 'Lista de asignaciones cargada correctamente', 200, true)
  @HandleException('Error al cargar las asignaciones de rol')
  async findAll(
    @Query() params: PaginationParamsDto,
    @Query('userId') userId?: string,
  ): Promise<PaginatedResponse<UserRole> | SuccessResponse<UserRole[]>> {
    if (userId) {
      const userRoles = await this.userRoleService.findByUser(+userId);
      return ResponseUtils.success(
        userRoles,
        'Roles del usuario cargados correctamente',
      );
    }
    const { data, total } = await this.userRoleService.findAll(params);
    return ResponseUtils.paginated(
      data,
      total,
      params.page,
      params.perPage,
      'Lista de asignaciones cargada correctamente',
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una asignación de rol por ID' })
  @ApiSuccessResponse(UserRoleResponseDto, 'Asignación de rol encontrada correctamente')
  @ApiNotFoundResponse({ description: 'La asignación de rol no existe.' })
  @HandleException('Error al obtener la asignación de rol')
  async findOne(@Param('id') id: string): Promise<SuccessResponse<UserRole>> {
    const userRole = await this.userRoleService.findOne(id);
    return ResponseUtils.success(
      userRole,
      'Asignación de rol encontrada correctamente',
    );
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una asignación de rol por ID' })
  @ApiBody({ type: UpdateUserRoleDto })
  @ApiSuccessResponse(UserRoleResponseDto, 'Asignación de rol actualizada correctamente')
  @ApiNotFoundResponse({ description: 'La asignación de rol no existe.' })
  @HandleException('Error al actualizar la asignación de rol')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateUserRoleDto,
  ): Promise<SuccessResponse<UserRole>> {
    const userRole = await this.userRoleService.update(id, dto);
    return ResponseUtils.success(
      userRole,
      'Asignación de rol actualizada correctamente',
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar una asignación de rol por ID' })
  @ApiNotFoundResponse({ description: 'La asignación de rol no existe.' })
  @HandleException('Error al eliminar la asignación de rol')
  async remove(@Param('id') id: string): Promise<void> {
    await this.userRoleService.remove(id);
  }
}