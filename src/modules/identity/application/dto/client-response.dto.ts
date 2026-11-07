import { ApiProperty } from '@nestjs/swagger';

export class ClientResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: '2026-09-21T10:30:00.000Z' })
  registrationDate: Date;

  @ApiProperty({ example: true })
  isActive: boolean;
}