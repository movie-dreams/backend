import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateUserDto {
  // `declare` keeps the properties out of the emitted class fields, so an
  // absent field is not materialised as `undefined` and cannot override the
  // route identifier when the repository merges the body with the route id.
  @ApiPropertyOptional({
    example: 1,
    description: 'ID de la persona asociada al usuario.',
  })
  @IsNumber({}, { message: 'El identificador debe ser un número.' })
  @IsOptional()
  declare id?: number;

  @ApiPropertyOptional({
    example: 'ana',
    description:
      'Nombre de usuario; se guarda tal como se envía, sin recortar espacios ni cambiar mayúsculas.',
    minLength: 1,
  })
  @IsString({ message: 'El nombre de usuario debe ser un texto.' })
  @IsNotEmpty({ message: 'El nombre de usuario no puede estar vacío.' })
  @IsOptional()
  declare username?: string;

  @ApiPropertyOptional({
    example: 'secreto123',
    description: 'Contraseña en texto plano (se cifrará al guardar).',
    minLength: 6,
    maxLength: 100,
  })
  @IsString({ message: 'La contraseña debe ser un texto.' })
  @IsNotEmpty({ message: 'La contraseña no puede estar vacía.' })
  @MinLength(6, {
    message: 'La contraseña debe tener entre 6 y 100 caracteres.',
  })
  @MaxLength(100, {
    message: 'La contraseña debe tener entre 6 y 100 caracteres.',
  })
  @IsOptional()
  declare password?: string;
}
