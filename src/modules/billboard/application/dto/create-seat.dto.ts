import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsInt, IsPositive } from 'class-validator';

export class CreateSeatDto {
  @ApiProperty({ description: 'ID de la sala a la que pertenece el asiento', example: 1, minimum: 1 })
  @IsInt()
  @IsPositive()
  roomId: number;

  @ApiProperty({ description: 'Fila del asiento', example: 'A' })
  @IsString()
  @IsNotEmpty()
  row: string;

  @ApiProperty({ description: 'Número del asiento', example: 1, minimum: 1 })
  @IsInt()
  @IsPositive()
  number: number;

  @ApiProperty({ description: 'Tipo de asiento', example: 'Estandar' })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiProperty({ description: 'Indica si el asiento está activo', example: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}