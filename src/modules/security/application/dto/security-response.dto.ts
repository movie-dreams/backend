import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '../../../auth/domain/enums/role.enum.js';

export class UserResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'ana' })
  username: string;

  @ApiProperty({ example: '2026-09-21T10:30:00.000Z' })
  createdAt?: Date;
}

export class RoleResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ enum: Role, example: Role.CLIENT })
  name: string;
}

export class UserRoleResponseDto {
  @ApiProperty({ example: 1 })
  id: string;

  @ApiProperty({ example: 1 })
  userId: number;

  @ApiProperty({ example: 1 })
  roleId: number;

  @ApiPropertyOptional({ example: '2026-09-21T00:00:00.000Z' })
  startDate?: Date;

  @ApiPropertyOptional({ example: '2026-12-31T00:00:00.000Z' })
  endDate?: Date;

  @ApiProperty({ example: true })
  status: boolean;

  @ApiPropertyOptional({ type: () => RoleResponseDto })
  role?: RoleResponseDto;
}