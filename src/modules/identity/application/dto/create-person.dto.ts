import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreatePersonDto {
  @ApiPropertyOptional({ example: 'Ana', description: 'Nombres de la persona.' })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiPropertyOptional({ example: 'Pérez', description: 'Apellidos de la persona.' })
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiPropertyOptional({ example: '12345678', description: 'Documento de identidad.' })
  @IsString()
  @IsOptional()
  document?: string;

  @ApiPropertyOptional({ example: '+51 987 654 321', description: 'Teléfono.' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ example: 'ana@example.com', description: 'Correo electrónico.' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ example: '1990-01-01', description: 'Fecha de nacimiento.' })
  @IsOptional()
  birthDate?: Date;

  @ApiPropertyOptional({ example: 'ana', description: 'Nombre de usuario para crear el acceso (opcional).' })
  @IsString()
  @IsOptional()
  username?: string;

  @ApiProperty({ example: 'secreto123', description: 'Contraseña (mínimo 6 caracteres).', minLength: 6, maxLength: 50 })
  @IsString()
  @IsOptional()
  @MinLength(6)
  @MaxLength(50)
  password?: string;
}