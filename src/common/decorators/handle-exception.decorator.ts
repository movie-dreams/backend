import { HttpException, Logger } from '@nestjs/common';
import { ResponseUtils } from '../utils/response.utils.js';

export function HandleException(defaultErrorMessage: string) {
  const logger = new Logger('HandleException');

  return function (
    _target: unknown,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: unknown[]) {
      try {
        return await originalMethod.apply(this, args);
      } catch (error: unknown) {
        const { statusCode, response } = ResponseUtils.fromError(
          error,
          defaultErrorMessage,
        );

        logger.error(`Error en ${String(_target?.toString?.() ?? 'desconocido')}.${propertyKey}`, {
          error,
          response,
          statusCode,
        });

        throw new HttpException(response, statusCode);
      }
    };

    return descriptor;
  };
}