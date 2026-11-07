import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, type JwtModuleOptions } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { SecurityModule } from '../security/security.module.js';
import { AuthService } from './application/services/auth.service.js';
import { AuthController } from './presentation/controllers/auth.controller.js';
import { JwtStrategy } from './infrastructure/strategies/jwt.strategy.js';
import { RolesGuard } from './infrastructure/guards/roles.guard.js';

@Global()
@Module({
  imports: [
    SecurityModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService): JwtModuleOptions => ({
        secret: configService.getOrThrow<string>('security.jwtSecret'),
        signOptions: {
          expiresIn: (configService.get<string>('security.jwtExpiresIn') ??
            '2h') as NonNullable<JwtModuleOptions['signOptions']>['expiresIn'],
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, RolesGuard],
  exports: [AuthService, JwtModule, RolesGuard],
})
export class AuthModule {}