import { ApiProperty } from '@nestjs/swagger';

export class RoomResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Sala 1' })
  name: string;

  @ApiProperty({ example: 100 })
  capacity: number;

  @ApiProperty({ example: 'Premium' })
  type: string;

  @ApiProperty({ example: true })
  isActive: boolean;
}