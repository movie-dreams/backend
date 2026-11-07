import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { PaginationParamsDto } from '../../../../common/dto/pagination-params.dto.js';

export class SearchPersonDto extends PaginationParamsDto {
  @ApiPropertyOptional({
    example: 'Ana',
    description: 'Coincidencia parcial en nombres, sin distinguir mayúsculas.',
    minLength: 1,
    maxLength: 100,
  })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  firstName?: string;

  @ApiPropertyOptional({
    example: 'Perez',
    description: 'Coincidencia parcial en apellidos, sin distinguir mayúsculas.',
    minLength: 1,
    maxLength: 100,
  })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  lastName?: string;
}