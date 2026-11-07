import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { Role } from '../../../auth/domain/enums/role.enum.js';

export class CreateRoleDto {
  @ApiProperty({ enum: Role, example: Role.CLIENT })
  @IsString()
  @IsNotEmpty()
  @IsEnum(Role)
  name: string;
}