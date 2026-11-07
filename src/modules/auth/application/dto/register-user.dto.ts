import { IsNotEmpty, IsNumber, IsString, MaxLength, MinLength } from 'class-validator';

export class RegisterUserDto {
  @IsNumber()
  personId: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  username: string;

  @IsString()
  @MinLength(6)
  @MaxLength(50)
  password: string;
}