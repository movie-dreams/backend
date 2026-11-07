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
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { HandleException } from '../../../../common/decorators/handle-exception.decorator.js';
import { PaginationParamsDto } from '../../../../common/dto/pagination-params.dto.js';
import { ApiSuccessResponse } from '../../../../common/decorators/api-success-response.decorator.js';
import {
  PaginationResult,
} from '../../../../common/interfaces/pagination-result.interface.js';
import { SuccessResponse } from '../../../../common/interfaces/custom-response.interface.js';
import { ResponseUtils } from '../../../../common/utils/response.utils.js';
import { ReservationService } from '../../application/services/reservation.service.js';
import { CreateReservationDto } from '../../application/dto/create-reservation.dto.js';
import { UpdateReservationDto } from '../../application/dto/update-reservation.dto.js';
import {
  ReservationCreatedDto,
  ReservationResponseDto,
} from '../../application/dto/reservation-response.dto.js';
import { ReservationWithDetails } from '../../domain/repositories/reservation.repository.js';
import { Reservation } from '../../domain/entities/reservation.domain.js';
import { Auth } from '../../../auth/infrastructure/decorators/auth.decorator.js';
import { Role } from '../../../auth/domain/enums/role.enum.js';

@ApiTags('Reservas')
@Controller('reservations')
export class ReservationController {
  constructor(private readonly reservationService: ReservationService) {}

  @Post()
  @Auth(Role.ADMIN, Role.MANAGER, Role.CLIENT)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Crear reserva',
    description:
      'Valida que la función exista y no esté cancelada, que la sala esté activa, que los asientos existan, estén activos y pertenezcan a la sala, y que no estén ocupados por otra reserva de la misma función.',
  })
  @ApiSuccessResponse(
    ReservationCreatedDto,
    'Reserva creada correctamente',
    201,
  )
  @ApiBadRequestResponse({
    description:
      'Asientos repetidos, función/sala no disponibles o asientos inválidos.',
  })
  @ApiConflictResponse({
    description: 'Uno o más asientos ya están reservados para esta función.',
  })
  @ApiNotFoundResponse({ description: 'La función no existe.' })
  @HandleException('Error al crear la reserva')
  async create(
    @Body() dto: CreateReservationDto,
  ): Promise<SuccessResponse<ReservationWithDetails>> {
    const result = await this.reservationService.create(dto);
    return ResponseUtils.success(result, 'Reserva creada correctamente');
  }

  @Get()
  @Auth(Role.ADMIN, Role.MANAGER, Role.CLIENT)
  @ApiOperation({ summary: 'Listar reservas', description: 'Opcionalmente filtradas por cliente.' })
  @ApiQuery({ type: PaginationParamsDto })
  @ApiQuery({ name: 'clientId', required: false, type: Number, description: 'ID del cliente' })
  @ApiSuccessResponse(ReservationResponseDto, 'Reservas listadas correctamente', 200, true)
  @HandleException('Error al listar las reservas')
  async findAll(
    @Query() params: PaginationParamsDto,
    @Query('clientId') clientId?: string,
  ): Promise<SuccessResponse<Reservation[] | PaginationResult<Reservation>>> {
    if (clientId) {
      return ResponseUtils.success(
        await this.reservationService.findByClient(+clientId),
        'Reservas del cliente obtenidas correctamente',
      );
    }
    const { data, total } = await this.reservationService.findAll(params);
    return ResponseUtils.paginated(
      data,
      total,
      params.page,
      params.perPage,
      'Reservas listadas correctamente',
    );
  }

  @Get(':id')
  @Auth(Role.ADMIN, Role.MANAGER, Role.CLIENT)
  @ApiOperation({ summary: 'Obtener una reserva por ID' })
  @ApiSuccessResponse(ReservationResponseDto, 'Reserva obtenida correctamente')
  @ApiNotFoundResponse({ description: 'La reserva no existe.' })
  @HandleException('Error al obtener la reserva')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<SuccessResponse<Reservation>> {
    return ResponseUtils.success(
      await this.reservationService.findOne(id),
      'Reserva obtenida correctamente',
    );
  }

  @Patch(':id')
  @Auth(Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Actualizar una reserva por ID' })
  @ApiSuccessResponse(ReservationResponseDto, 'Reserva actualizada correctamente')
  @ApiNotFoundResponse({ description: 'La reserva no existe.' })
  @HandleException('Error al actualizar la reserva')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateReservationDto,
  ): Promise<SuccessResponse<Reservation>> {
    return ResponseUtils.success(
      await this.reservationService.update(id, dto),
      'Reserva actualizada correctamente',
    );
  }

  @Delete(':id')
  @Auth(Role.ADMIN, Role.MANAGER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar una reserva por ID' })
  @ApiNotFoundResponse({ description: 'La reserva no existe.' })
  @HandleException('Error al eliminar la reserva')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.reservationService.remove(id);
  }
}