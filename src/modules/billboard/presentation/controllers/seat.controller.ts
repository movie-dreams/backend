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
import { SeatService } from '../../application/services/seat.service.js';
import { CreateSeatDto } from '../../application/dto/create-seat.dto.js';
import { UpdateSeatDto } from '../../application/dto/update-seat.dto.js';
import { SeatResponseDto } from '../../application/dto/seat-response.dto.js';
import { Seat } from '../../domain/entities/seat.domain.js';

@ApiTags('Asientos')
@Controller('seats')
export class SeatController {
  constructor(private readonly seatService: SeatService) {}

  @Post()
  @Auth(Role.ADMIN, Role.MANAGER)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Registrar asiento' })
  @ApiBody({ type: CreateSeatDto })
  @ApiSuccessResponse(SeatResponseDto, 'Asiento registrado correctamente', 201)
  @ApiBadRequestResponse({ description: 'Datos inválidos.' })
  @HandleException('Error al crear el asiento')
  async create(@Body() dto: CreateSeatDto): Promise<SuccessResponse<Seat>> {
    const seat = await this.seatService.create(dto);
    return ResponseUtils.success(seat, 'Asiento registrado correctamente');
  }

  @Get()
  @ApiOperation({
    summary: 'Listar asientos',
    description: 'Opcionalmente filtrados por sala.',
  })
  @ApiQuery({ type: PaginationParamsDto })
  @ApiQuery({ name: 'roomId', required: false, type: Number, description: 'ID de la sala' })
  @ApiSuccessResponse(SeatResponseDto, 'Lista de asientos cargada correctamente', 200, true)
  @HandleException('Error al cargar la lista de asientos')
  async findAll(
    @Query() params: PaginationParamsDto,
    @Query('roomId') roomId?: string,
  ): Promise<PaginatedResponse<Seat> | SuccessResponse<Seat[]>> {
    if (roomId) {
      const seats = await this.seatService.findByRoom(+roomId);
      return ResponseUtils.success(
        seats,
        'Asientos de la sala cargados correctamente',
      );
    }
    const { data, total } = await this.seatService.findAll(params);
    return ResponseUtils.paginated(
      data,
      total,
      params.page,
      params.perPage,
      'Lista de asientos cargada correctamente',
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un asiento por ID' })
  @ApiSuccessResponse(SeatResponseDto, 'Asiento encontrado correctamente')
  @ApiNotFoundResponse({ description: 'El asiento no existe.' })
  @HandleException('Error al obtener el asiento')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<SuccessResponse<Seat>> {
    const seat = await this.seatService.findOne(id);
    return ResponseUtils.success(seat, 'Asiento encontrado correctamente');
  }

  @Patch(':id')
  @Auth(Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Actualizar un asiento por ID' })
  @ApiBody({ type: UpdateSeatDto })
  @ApiSuccessResponse(SeatResponseDto, 'Asiento actualizado correctamente')
  @ApiNotFoundResponse({ description: 'El asiento no existe.' })
  @HandleException('Error al actualizar el asiento')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSeatDto,
  ): Promise<SuccessResponse<Seat>> {
    const seat = await this.seatService.update(id, dto);
    return ResponseUtils.success(seat, 'Asiento actualizado correctamente');
  }

  @Delete(':id')
  @Auth(Role.ADMIN, Role.MANAGER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar un asiento por ID' })
  @ApiNotFoundResponse({ description: 'El asiento no existe.' })
  @HandleException('Error al eliminar el asiento')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.seatService.remove(id);
  }
}