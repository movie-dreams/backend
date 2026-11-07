import { ApiProperty } from '@nestjs/swagger';

export class SeatResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 1 })
  roomId: number;

  @ApiProperty({ example: 'A' })
  row: string;

  @ApiProperty({ example: 1 })
  number: number;

  @ApiProperty({ example: 'Estandar' })
  type: string;

  @ApiProperty({ example: true })
  isActive: boolean;
}