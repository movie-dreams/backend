import { applyDecorators, Type } from '@nestjs/common';
import { ApiExtraModels, ApiResponse, getSchemaPath } from '@nestjs/swagger';

/** Documenta el formato que devuelve ResponseUtils (success / paginated). */
export function ApiSuccessResponse(
  model: Type<unknown>,
  description: string,
  status = 200,
  paginated = false,
) {
  return applyDecorators(
    ApiExtraModels(model),
    ApiResponse({
      status,
      description,
      schema: {
        type: 'object',
        required: [
          'status',
          'message',
          'data',
          'timestamp',
          ...(paginated ? ['total', 'page', 'perPage', 'totalPages'] : []),
        ],
        properties: {
          status: { type: 'string', enum: ['success'], example: 'success' },
          message: { type: 'string', example: description },
          data: paginated
            ? { type: 'array', items: { $ref: getSchemaPath(model) } }
            : { $ref: getSchemaPath(model) },
          timestamp: { type: 'string', format: 'date-time' },
          ...(paginated
            ? {
                total: { type: 'integer', example: 25 },
                page: { type: 'number', example: 1 },
                perPage: { type: 'number', example: 10 },
                totalPages: { type: 'integer', example: 3 },
              }
            : {}),
        },
      },
    }),
  );
}