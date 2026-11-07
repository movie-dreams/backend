import {
  ApiTags,
  ApiQuery,
  ApiOperation,
  ApiBody,
  ApiConsumes,
  ApiExtraModels,
  ApiBadRequestResponse,
  ApiPayloadTooLargeResponse,
  ApiInternalServerErrorResponse,
  ApiTooManyRequestsResponse,
  ApiNotFoundResponse,
  getSchemaPath,
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
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Auth } from '../../../auth/infrastructure/decorators/auth.decorator.js';
import { Role } from '../../../auth/domain/enums/role.enum.js';
import { multerImageConfig } from '../../../../common/config/multer.config.js';
import { ApiSuccessResponse } from '../../../../common/decorators/api-success-response.decorator.js';
import { HandleException } from '../../../../common/decorators/handle-exception.decorator.js';
import { PaginationParamsDto } from '../../../../common/dto/pagination-params.dto.js';
import { PaginatedResponse, SuccessResponse } from '../../../../common/interfaces/custom-response.interface.js';
import { ResponseUtils } from '../../../../common/utils/response.utils.js';
import { MovieService } from '../../application/services/movie.service.js';
import { CreateMovieDto } from '../../application/dto/create-movie.dto.js';
import { UpdateMovieDto } from '../../application/dto/update-movie.dto.js';
import { MovieListedDto, MovieResponseDto } from '../../application/dto/movie-response.dto.js';
import { Movie } from '../../domain/entities/movie.domain.js';

@ApiTags('Películas')
@ApiExtraModels(CreateMovieDto)
@ApiTooManyRequestsResponse({ description: 'Límite de solicitudes excedido.' })
@ApiInternalServerErrorResponse({ description: 'Error interno al procesar películas.' })
@Controller('movies')
export class MovieController {
  constructor(private readonly movieService: MovieService) {}

  @Post()
  @Auth(Role.ADMIN, Role.MANAGER)
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FilesInterceptor('images', 5, multerImageConfig('pelicula', 5)),
  )
  @ApiOperation({
    summary: 'Registrar película',
    description:
      'Admite JSON sin archivos o multipart/form-data con hasta 5 imágenes JPG, JPEG, PNG o WEBP de máximo 5 MiB cada una.',
  })
  @ApiConsumes('application/json', 'multipart/form-data')
  @ApiBody({
    schema: {
      allOf: [
        { $ref: getSchemaPath(CreateMovieDto) },
        {
          type: 'object',
          properties: {
            images: {
              type: 'array',
              maxItems: 5,
              description: 'Archivos opcionales, solo para multipart/form-data.',
              items: { type: 'string', format: 'binary' },
            },
          },
        },
      ],
    },
  })
  @ApiSuccessResponse(MovieResponseDto, 'Película registrada correctamente', 201)
  @ApiBadRequestResponse({ description: 'Datos inválidos o formato de imagen no permitido.' })
  @ApiPayloadTooLargeResponse({ description: 'Alguna imagen supera los 5 MiB.' })
  @HandleException('Error al crear la película')
  async create(
    @Body() dto: CreateMovieDto,
    @UploadedFiles() images?: Express.Multer.File[],
  ): Promise<SuccessResponse<Movie>> {
    const movie = await this.movieService.create(dto, images);
    return ResponseUtils.success(movie, 'Película registrada correctamente');
  }

  @Get()
  @ApiOperation({
    summary: 'Listar películas',
    description: 'Devuelve películas paginadas con sus imágenes.',
  })
  @ApiQuery({ type: PaginationParamsDto })
  @ApiSuccessResponse(MovieListedDto, 'Lista de películas cargada correctamente', 200, true)
  @HandleException('Error al cargar la lista de películas')
  async findAll(
    @Query() params: PaginationParamsDto,
  ): Promise<PaginatedResponse<Movie>> {
    const { data, total } = await this.movieService.findAll(params);
    return ResponseUtils.paginated(
      data,
      total,
      params.page,
      params.perPage,
      'Lista de películas cargada correctamente',
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una película por ID' })
  @ApiSuccessResponse(MovieResponseDto, 'Película encontrada correctamente')
  @ApiNotFoundResponse({ description: 'La película no existe.' })
  @HandleException('Error al obtener la película')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<SuccessResponse<Movie>> {
    const movie = await this.movieService.findOne(id);
    return ResponseUtils.success(movie, 'Película encontrada correctamente');
  }

  @Patch(':id')
  @Auth(Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Actualizar una película por ID' })
  @ApiBody({ type: UpdateMovieDto })
  @ApiSuccessResponse(MovieResponseDto, 'Película actualizada correctamente')
  @ApiNotFoundResponse({ description: 'La película no existe.' })
  @HandleException('Error al actualizar la película')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateMovieDto,
  ): Promise<SuccessResponse<Movie>> {
    const movie = await this.movieService.update(id, dto);
    return ResponseUtils.success(movie, 'Película actualizada correctamente');
  }

  @Delete(':id')
  @Auth(Role.ADMIN, Role.MANAGER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar una película por ID' })
  @ApiNotFoundResponse({ description: 'La película no existe.' })
  @HandleException('Error al eliminar la película')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.movieService.remove(id);
  }
}