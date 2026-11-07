import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsDateString, IsNumber, IsOptional } from 'class-validator';

export class CreateUserRoleDto {
  @ApiProperty({ example: 1, description: 'ID del usuario.' })
  @Type(() => Number)
  @IsNumber()
  userId: number;

  @ApiProperty({ example: 1, description: 'ID del rol.' })
  @Type(() => Number)
  @IsNumber()
  roleId: number;

  @ApiPropertyOptional({ example: '2026-09-21T00:00:00.000Z', description: 'Fecha de inicio de la asignación.' })
  @IsDateString()
  @IsOptional()
  startDate?: Date;

  @ApiPropertyOptional({ example: '2026-12-31T00:00:00.000Z', description: 'Fecha de fin de la asignación.' })
  @IsDateString()
  @IsOptional()
  endDate?: Date;

  @ApiPropertyOptional({ example: true, default: true })
  @IsBoolean()
  @IsOptional()
  status?: boolean = true;
}