import { ApiProperty } from '@nestjs/swagger';

export class TokenResponseDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'Token JWT de acceso',
  })
  token: string;
}

export class AuthenticatedUserDto {
  @ApiProperty({ example: 1, description: 'Identificador del usuario' })
  id: number;

  @ApiProperty({ example: 'admin' })
  username: string;

  @ApiProperty({
    example: ['Administrador'],
    description: 'Roles activos del usuario',
  })
  roles: string[];
}