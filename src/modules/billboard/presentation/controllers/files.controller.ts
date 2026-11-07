import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiTooManyRequestsResponse,
} from '@nestjs/swagger';
import { Controller, Get, Param, Res } from '@nestjs/common';
import type { Response } from 'express';
import { HandleException } from '../../../../common/decorators/handle-exception.decorator.js';
import { FilesService } from '../../application/services/files.service.js';

@ApiTags('Archivos')
@ApiTooManyRequestsResponse({ description: 'Límite de solicitudes excedido.' })
@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Get('movies/:fileName')
  @ApiOperation({
    summary: 'Obtener imagen de película',
    description: 'Devuelve el archivo de imagen solicitado.',
  })
  @ApiParam({
    name: 'fileName',
    type: String,
    example: 'pelicula-550e8400-e29b-41d4-a716-446655440000.jpg',
  })
  @ApiOkResponse({
    description: 'Imagen encontrada.',
    content: {
      'image/jpeg': { schema: { type: 'string', format: 'binary' } },
      'image/png': { schema: { type: 'string', format: 'binary' } },
      'image/webp': { schema: { type: 'string', format: 'binary' } },
    },
  })
  @ApiNotFoundResponse({ description: 'No se encontró la imagen solicitada.' })
  @HandleException('Error al obtener la imagen')
  showMovieImage(
    @Param('fileName') fileName: string,
    @Res() response: Response,
  ): void {
    const ruta = this.filesService.obtenerImagenPelicula(fileName);
    response.sendFile(ruta);
  }
}