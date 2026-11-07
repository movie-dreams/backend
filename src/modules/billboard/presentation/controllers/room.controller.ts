import {
  ApiTags,
  ApiOperation,
  ApiQuery,
  ApiBody,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
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
import { Auth } from '../../../auth/infrastructure/decorators/auth.decorator.js';
import { Role } from '../../../auth/domain/enums/role.enum.js';
import { ApiSuccessResponse } from '../../../../common/decorators/api-success-response.decorator.js';
import { HandleException } from '../../../../common/decorators/handle-exception.decorator.js';
import { PaginationParamsDto } from '../../../../common/dto/pagination-params.dto.js';
import { PaginatedResponse, SuccessResponse } from '../../../../common/interfaces/custom-response.interface.js';
import { ResponseUtils } from '../../../../common/utils/response.utils.js';
import { RoomService } from '../../application/services/room.service.js';
import { CreateRoomDto } from '../../application/dto/create-room.dto.js';
import { UpdateRoomDto } from '../../application/dto/update-room.dto.js';
import { RoomResponseDto } from '../../application/dto/room-response.dto.js';
import { Room } from '../../domain/entities/room.domain.js';

@ApiTags('Salas')
@Controller('rooms')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @Post()
  @Auth(Role.ADMIN, Role.MANAGER)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Registrar sala' })
  @ApiBody({ type: CreateRoomDto })
  @ApiSuccessResponse(RoomResponseDto, 'Sala registrada correctamente', 201)
  @ApiBadRequestResponse({ description: 'Datos inválidos.' })
  @HandleException('Error al crear la sala')
  async create(@Body() dto: CreateRoomDto): Promise<SuccessResponse<Room>> {
    const room = await this.roomService.create(dto);
    return ResponseUtils.success(room, 'Sala registrada correctamente');
  }

  @Get()
  @ApiOperation({ summary: 'Listar salas' })
  @ApiQuery({ type: PaginationParamsDto })
  @ApiSuccessResponse(RoomResponseDto, 'Lista de salas cargada correctamente', 200, true)
  @HandleException('Error al cargar la lista de salas')
  async findAll(
    @Query() params: PaginationParamsDto,
  ): Promise<PaginatedResponse<Room>> {
    const { data, total } = await this.roomService.findAll(params);
    return ResponseUtils.paginated(
      data,
      total,
      params.page,
      params.perPage,
      'Lista de salas cargada correctamente',
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una sala por ID' })
  @ApiSuccessResponse(RoomResponseDto, 'Sala encontrada correctamente')
  @ApiNotFoundResponse({ description: 'La sala no existe.' })
  @HandleException('Error al obtener la sala')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<SuccessResponse<Room>> {
    const room = await this.roomService.findOne(id);
    return ResponseUtils.success(room, 'Sala encontrada correctamente');
  }

  @Patch(':id')
  @Auth(Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Actualizar una sala por ID' })
  @ApiBody({ type: UpdateRoomDto })
  @ApiSuccessResponse(RoomResponseDto, 'Sala actualizada correctamente')
  @ApiNotFoundResponse({ description: 'La sala no existe.' })
  @HandleException('Error al actualizar la sala')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateRoomDto,
  ): Promise<SuccessResponse<Room>> {
    const room = await this.roomService.update(id, dto);
    return ResponseUtils.success(room, 'Sala actualizada correctamente');
  }

  @Delete(':id')
  @Auth(Role.ADMIN, Role.MANAGER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar una sala por ID' })
  @ApiNotFoundResponse({ description: 'La sala no existe.' })
  @HandleException('Error al eliminar la sala')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.roomService.remove(id);
  }
}