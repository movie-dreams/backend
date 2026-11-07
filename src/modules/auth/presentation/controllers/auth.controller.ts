import { Body, Controller, Get, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiSuccessResponse } from '../../../../common/decorators/api-success-response.decorator.js';
import { AuthService } from '../../application/services/auth.service.js';
import { LoginDto } from '../../application/dto/login.dto.js';
import { AuthenticatedUserDto, TokenResponseDto } from '../../application/dto/token-response.dto.js';
import { HandleException } from '../../../../common/decorators/handle-exception.decorator.js';
import { ResponseUtils } from '../../../../common/utils/response.utils.js';
import type { SuccessResponse } from '../../../../common/interfaces/custom-response.interface.js';
import { Auth } from '../../infrastructure/decorators/auth.decorator.js';
import { CurrentUser } from '../../infrastructure/decorators/current-user.decorator.js';
import type { JwtPayload } from '../../domain/interfaces/jwt-payload.interface.js';

@ApiTags('Autenticación')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Iniciar sesión',
    description: 'Autentica un usuario y devuelve un token JWT.',
  })
  @ApiBody({ type: LoginDto })
  @ApiSuccessResponse(TokenResponseDto, 'Usuario autenticado correctamente')
  @ApiBadRequestResponse({ description: 'Datos de ingreso inválidos' })
  @HandleException('Error en la autenticación')
  async login(@Body() dto: LoginDto): Promise<SuccessResponse<TokenResponseDto>> {
    const data = await this.authService.login(dto);
    return ResponseUtils.success(data, 'Usuario autenticado correctamente');
  }

  @Get('me')
  @Auth()
  @ApiOperation({ summary: 'Obtener usuario autenticado', description: 'Devuelve los datos del token JWT vigente.' })
  @ApiSuccessResponse(AuthenticatedUserDto, 'Usuario autenticado')
  @HandleException('Error al obtener el usuario autenticado')
  me(@CurrentUser() user: JwtPayload): SuccessResponse<AuthenticatedUserDto> {
    return ResponseUtils.success(user, 'Usuario autenticado');
  }
}