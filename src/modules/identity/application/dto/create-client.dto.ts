import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsBoolean } from 'class-validator';

export class CreateClientDto {
  @ApiProperty({ example: 1, description: 'ID de la persona que será el cliente.' })
  @IsNumber()
  id: number;

  @ApiPropertyOptional({ example: true, default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}