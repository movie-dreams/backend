import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, IsOptional, IsBoolean, Min } from 'class-validator';

export class CreateRoomDto {
  @ApiProperty({ description: 'Nombre de la sala', example: 'Sala 1' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Capacidad de la sala', example: 100, minimum: 1 })
  @IsNumber()
  @Min(1)
  capacity: number;

  @ApiProperty({ description: 'Tipo de sala', example: 'Premium' })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiProperty({ description: 'Indica si la sala está activa', example: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}