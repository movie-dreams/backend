import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  HttpStatus,
  HttpCode,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiQuery,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { ReservationDetailService } from '../../application/services/reservation-detail.service.js';
import { CreateReservationDetailDto } from '../../application/dto/create-reservation-detail.dto.js';
import { UpdateReservationDetailDto } from '../../application/dto/update-reservation-detail.dto.js';
import { ApiSuccessResponse } from '../../../../common/decorators/api-success-response.decorator.js';
import { ReservationDetailResponseDto } from '../../application/dto/reservation-response.dto.js';
import { PaginationParamsDto } from '../../../../common/dto/pagination-params.dto.js';

@ApiTags('Detalles de Reserva')
@Controller('reservation-details')
export class ReservationDetailController {
  constructor(private readonly detailService: ReservationDetailService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Registrar detalle de reserva' })
  @ApiSuccessResponse(ReservationDetailResponseDto, 'Detalle de reserva creado correctamente', 201)
  @ApiBadRequestResponse({ description: 'Datos inválidos.' })
  create(@Body() dto: CreateReservationDetailDto) {
    return this.detailService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar detalles de reserva', description: 'Opcionalmente filtrados por reserva.' })
  @ApiQuery({ type: PaginationParamsDto })
  @ApiQuery({ name: 'reservationId', required: false, type: Number, description: 'ID de la reserva' })
  @ApiSuccessResponse(ReservationDetailResponseDto, 'Detalles listados correctamente', 200, true)
  findAll(@Query() params: PaginationParamsDto, @Query('reservationId') reservationId?: string) {
    if (reservationId) {
      return this.detailService.findByReservation(+reservationId);
    }
    return this.detailService.findAll(params);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un detalle de reserva por ID' })
  @ApiSuccessResponse(ReservationDetailResponseDto, 'Detalle obtendido correctamente')
  @ApiNotFoundResponse({ description: 'El detalle no existe.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.detailService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un detalle de reserva por ID' })
  @ApiSuccessResponse(ReservationDetailResponseDto, 'Detalle actualizado correctamente')
  @ApiNotFoundResponse({ description: 'El detalle no existe.' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateReservationDetailDto,
  ) {
    return this.detailService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar un detalle de reserva por ID' })
  @ApiNotFoundResponse({ description: 'El detalle no existe.' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.detailService.remove(id);
  }
}