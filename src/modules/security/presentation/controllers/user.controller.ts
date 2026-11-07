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
import {
  PaginatedResponse,
  SuccessResponse,
} from '../../../../common/interfaces/custom-response.interface.js';
import { ResponseUtils } from '../../../../common/utils/response.utils.js';
import { UserService } from '../../application/services/user.service.js';
import { CreateUserDto } from '../../application/dto/create-user.dto.js';
import { UpdateUserDto } from '../../application/dto/update-user.dto.js';
import { UserResponseDto } from '../../application/dto/security-response.dto.js';
import { User } from '../../domain/entities/user.domain.js';

@ApiTags('Usuarios')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Crear usuario',
    description:
      'Registra de forma conjunta la persona (solo con su email), su registro de cliente activo y la cuenta de acceso con el email como nombre de usuario y el rol Cliente activo. Solo admite email y contraseña.',
  })
  @ApiBody({ type: CreateUserDto })
  @ApiSuccessResponse(UserResponseDto, 'Usuario creado correctamente', 201)
  @ApiConflictResponse({
    description: 'El email ya está registrado.',
  })
  @ApiBadRequestResponse({
    description:
      'Datos no admitidos (solo se aceptan email y contraseña) o datos inválidos (email vacío, con formato inválido o de más de 255 caracteres; contraseña fuera del rango de 6 a 100 caracteres).',
  })
  @HandleException('Error al crear el usuario')
  async create(@Body() dto: CreateUserDto): Promise<SuccessResponse<User>> {
    const user = await this.userService.create(dto);
    return ResponseUtils.success(user, 'Usuario creado correctamente');
  }

  @Get()
  @ApiOperation({ summary: 'Listar usuarios' })
  @ApiQuery({ type: PaginationParamsDto })
  @ApiSuccessResponse(UserResponseDto, 'Lista de usuarios cargada correctamente', 200, true)
  @HandleException('Error al cargar la lista de usuarios')
  async findAll(@Query() params: PaginationParamsDto): Promise<PaginatedResponse<User>> {
    const { data, total } = await this.userService.findAll(params);
    return ResponseUtils.paginated(
      data,
      total,
      params.page,
      params.perPage,
      'Lista de usuarios cargada correctamente',
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un usuario por ID' })
  @ApiSuccessResponse(UserResponseDto, 'Usuario encontrado correctamente')
  @ApiNotFoundResponse({ description: 'El usuario no existe.' })
  @HandleException('Error al obtener el usuario')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<SuccessResponse<User>> {
    const user = await this.userService.findOne(id);
    return ResponseUtils.success(user, 'Usuario encontrado correctamente');
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un usuario por ID' })
  @ApiBody({ type: UpdateUserDto })
  @ApiSuccessResponse(UserResponseDto, 'Usuario actualizado correctamente')
  @ApiNotFoundResponse({ description: 'El usuario no existe.' })
  @HandleException('Error al actualizar el usuario')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserDto,
  ): Promise<SuccessResponse<User>> {
    const user = await this.userService.update(id, dto);
    return ResponseUtils.success(user, 'Usuario actualizado correctamente');
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar un usuario por ID' })
  @ApiNotFoundResponse({ description: 'El usuario no existe.' })
  @HandleException('Error al eliminar el usuario')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.userService.remove(id);
  }
}
