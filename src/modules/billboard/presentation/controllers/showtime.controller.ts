import {
  ApiTags,
  ApiOperation,
  ApiQuery,
  ApiBody,
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiNotFoundResponse,
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
import { ShowtimeService } from '../../application/services/showtime.service.js';
import { CreateShowtimeDto, ShowtimeCreatedDto } from '../../application/dto/create-showtime.dto.js';
import { UpdateShowtimeDto } from '../../application/dto/update-showtime.dto.js';
import { Showtime } from '../../domain/entities/showtime.domain.js';

@ApiTags('Funciones')
@Controller('showtimes')
export class ShowtimeController {
  constructor(private readonly showtimeService: ShowtimeService) {}

  @Post()
  @Auth(Role.ADMIN, Role.MANAGER)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Registrar función',
    description:
      'Seleccione movieId de GET /api/v1/movies y roomId de GET /api/v1/billboard/rooms. Envíe fecha YYYY-MM-DD y horas HH:mm:ss del mismo día. Omita status para PROGRAMADA.',
  })
  @ApiBody({ type: CreateShowtimeDto })
  @ApiSuccessResponse(ShowtimeCreatedDto, 'Función registrada correctamente', 201)
  @ApiBadRequestResponse({ description: 'Datos inválidos, hora final no posterior al inicio, sala o película inactiva.' })
  @ApiNotFoundResponse({ description: 'Sala o película inexistente.' })
  @ApiConflictResponse({ description: 'Otra función no cancelada ocupa la misma sala, fecha y horario.' })
  @HandleException('Error al crear la función')
  async create(
    @Body() dto: CreateShowtimeDto,
  ): Promise<SuccessResponse<Showtime>> {
    const showtime = await this.showtimeService.create(dto);
    return ResponseUtils.success(showtime, 'Función registrada correctamente');
  }

  @Get()
  @ApiOperation({ summary: 'Listar funciones', description: 'Opcionalmente filtradas por película.' })
  @ApiQuery({ type: PaginationParamsDto })
  @ApiQuery({ name: 'movieId', required: false, type: Number, description: 'ID de la película' })
  @ApiSuccessResponse(ShowtimeCreatedDto, 'Lista de funciones cargada correctamente', 200, true)
  @HandleException('Error al cargar la lista de funciones')
  async findAll(
    @Query() params: PaginationParamsDto,
    @Query('movieId') movieId?: string,
  ): Promise<PaginatedResponse<Showtime> | SuccessResponse<Showtime[]>> {
    if (movieId) {
      const showtimes = await this.showtimeService.findByMovie(+movieId);
      return ResponseUtils.success(
        showtimes,
        'Funciones de la película cargadas correctamente',
      );
    }
    const { data, total } = await this.showtimeService.findAll(params);
    return ResponseUtils.paginated(
      data,
      total,
      params.page,
      params.perPage,
      'Lista de funciones cargada correctamente',
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una función por ID' })
  @ApiSuccessResponse(ShowtimeCreatedDto, 'Función encontrada correctamente')
  @ApiNotFoundResponse({ description: 'La función no existe.' })
  @HandleException('Error al obtener la función')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<SuccessResponse<Showtime>> {
    const showtime = await this.showtimeService.findOne(id);
    return ResponseUtils.success(showtime, 'Función encontrada correctamente');
  }

  @Patch(':id')
  @Auth(Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Actualizar una función por ID' })
  @ApiBody({ type: UpdateShowtimeDto })
  @ApiSuccessResponse(ShowtimeCreatedDto, 'Función actualizada correctamente')
  @ApiNotFoundResponse({ description: 'La función no existe.' })
  @ApiConflictResponse({ description: 'La sala ya tiene otra función en ese horario.' })
  @HandleException('Error al actualizar la función')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateShowtimeDto,
  ): Promise<SuccessResponse<Showtime>> {
    const showtime = await this.showtimeService.update(id, dto);
    return ResponseUtils.success(showtime, 'Función actualizada correctamente');
  }

  @Delete(':id')
  @Auth(Role.ADMIN, Role.MANAGER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar una función por ID' })
  @ApiNotFoundResponse({ description: 'La función no existe.' })
  @HandleException('Error al eliminar la función')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.showtimeService.remove(id);
  }
}