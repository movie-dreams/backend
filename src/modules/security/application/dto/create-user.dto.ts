import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { normalizeIdentifier } from '../../../../common/utils/identifier.utils.js';

export class CreateUserDto {
  @ApiProperty({
    example: 'ana@dominio.com',
    description:
      'Email de la persona; se recortan los espacios y se convierte a minúsculas.',
    maxLength: 255,
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? normalizeIdentifier(value) : value,
  )
  @IsString({ message: 'El email debe ser un texto.' })
  @IsNotEmpty({ message: 'El email es obligatorio.' })
  @IsEmail(
    { ignore_max_length: true },
    { message: 'El email no es válido.' },
  )
  @MaxLength(255, {
    message: 'El email no puede superar los 255 caracteres.',
  })
  email: string;

  @ApiProperty({
    example: 'secreto123',
    description: 'Contraseña en texto plano (se cifrará al guardar).',
    minLength: 6,
    maxLength: 100,
  })
  @IsString({ message: 'La contraseña debe ser un texto.' })
  @IsNotEmpty({ message: 'La contraseña es obligatoria.' })
  @MinLength(6, {
    message: 'La contraseña debe tener entre 6 y 100 caracteres.',
  })
  @MaxLength(100, {
    message: 'La contraseña debe tener entre 6 y 100 caracteres.',
  })
  password: string;
}
