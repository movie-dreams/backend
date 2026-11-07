import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { normalizeIdentifier } from '../../../../common/utils/identifier.utils.js';

export class LoginDto {
  @ApiProperty({
    example: 'ana@dominio.com',
    description:
      'Nombre de usuario registrado; se recortan los espacios y se convierte a minúsculas.',
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? normalizeIdentifier(value) : value,
  )
  @IsString({ message: 'El nombre de usuario debe ser un texto.' })
  @IsNotEmpty({ message: 'El nombre de usuario es obligatorio.' })
  username: string;

  @ApiProperty({
    example: 'claveSegura123',
    minLength: 6,
    maxLength: 100,
    description: 'Contraseña del usuario (entre 6 y 100 caracteres).',
  })
  @IsString({ message: 'La contraseña debe ser un texto.' })
  @MinLength(6, {
    message: 'La contraseña debe tener entre 6 y 100 caracteres.',
  })
  @MaxLength(100, {
    message: 'La contraseña debe tener entre 6 y 100 caracteres.',
  })
  password: string;
}
