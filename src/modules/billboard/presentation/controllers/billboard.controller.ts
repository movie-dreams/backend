import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { ApiSuccessResponse } from '../../../../common/decorators/api-success-response.decorator.js';
import { HandleException } from '../../../../common/decorators/handle-exception.decorator.js';
import { SuccessResponse } from '../../../../common/interfaces/custom-response.interface.js';
import { ResponseUtils } from '../../../../common/utils/response.utils.js';
import {
  RoomCarteleraDto,
  RoomSummaryDto,
  SeatCarteleraDto,
  ShowtimeCarteleraDto,
} from '../../application/dto/cartelera-response.dto.js';
import {
  ConsultSeatsQueryDto,
  ConsultShowtimesQueryDto,
  ShowtimeParamDto,
} from '../../application/dto/consult-cartelera.dto.js';
import { BillboardService } from '../../application/services/billboard.service.js';

@ApiTags('Cartelera')
@Controller('billboard')
export class BillboardController {
  constructor(private readonly billboardService: BillboardService) {}

  @Get('rooms')
  @ApiOperation({ summary: 'Listar salas' })
  @ApiQuery({ name: 'onlyActive', required: false, type: Boolean, example: true })
  @ApiSuccessResponse(RoomCarteleraDto, 'Lista de salas cargada correctamente')
  @HandleException('Error al listar las salas')
  async listRooms(
    @Query('onlyActive') onlyActive?: boolean,
  ): Promise<SuccessResponse<RoomCarteleraDto[]>> {
    const rooms = await this.billboardService.listRooms(onlyActive);
    return ResponseUtils.success(rooms, 'Lista de salas cargada correctamente');
  }

  @Get('rooms/summary')
  @ApiOperation({
    summary: 'Verificar capacidad y cantidad de asientos por sala',
  })
  @ApiSuccessResponse(RoomSummaryDto, 'Resumen de salas cargado correctamente')
  @HandleException('Error al cargar el resumen de salas')
  async roomSummaries(): Promise<SuccessResponse<RoomSummaryDto[]>> {
    const summaries = await this.billboardService.roomSummaries();
    return ResponseUtils.success(
      summaries,
      'Resumen de salas cargado correctamente',
    );
  }

  @Get('seats')
  @ApiOperation({
    summary: 'Listar asientos, opcionalmente filtrados por sala',
  })
  @ApiQuery({ name: 'roomId', required: false, type: Number, description: 'ID de la sala' })
  @ApiSuccessResponse(SeatCarteleraDto, 'Lista de asientos cargada correctamente')
  @HandleException('Error al listar los asientos')
  async listSeats(
    @Query() query: ConsultSeatsQueryDto,
  ): Promise<SuccessResponse<SeatCarteleraDto[]>> {
    const seats = await this.billboardService.listSeats(query.roomId);
    return ResponseUtils.success(
      seats,
      'Lista de asientos cargada correctamente',
    );
  }

  @Get('showtimes')
  @ApiOperation({
    summary: 'Listar funciones con película, sala, horario y precio',
  })
  @ApiQuery({ name: 'movieId', required: false, type: Number, description: 'ID de la película' })
  @ApiSuccessResponse(ShowtimeCarteleraDto, 'Lista de funciones cargada correctamente')
  @HandleException('Error al listar las funciones')
  async listShowtimes(
    @Query() query: ConsultShowtimesQueryDto,
  ): Promise<SuccessResponse<ShowtimeCarteleraDto[]>> {
    const showtimes = await this.billboardService.listShowtimes(query.movieId);
    return ResponseUtils.success(
      showtimes,
      'Lista de funciones cargada correctamente',
    );
  }

  @Get('showtimes/:id/seats')
  @ApiOperation({
    summary: 'Consultar disponibilidad de asientos para una función',
    description:
      'Las reservas CANCELADA no ocupan asientos. La disponibilidad puede cambiar antes de confirmar.',
  })
  @ApiSuccessResponse(SeatCarteleraDto, 'Disponibilidad cargada correctamente')
  @ApiNotFoundResponse({ description: 'Función inexistente.' })
  @HandleException('Error al consultar la disponibilidad de asientos')
  async seatsByShowtime(
    @Param() params: ShowtimeParamDto,
  ): Promise<SuccessResponse<SeatCarteleraDto[]>> {
    const seats = await this.billboardService.seatsByShowtime(params.id);
    return ResponseUtils.success(
      seats,
      'Disponibilidad de asientos cargada correctamente',
    );
  }
}