import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ServeStaticModule } from '@nestjs/serve-static';
import { seconds, ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { DataSource } from 'typeorm';
import { addTransactionalDataSource } from 'typeorm-transactional';
import { appConfig, databaseConfig, securityConfig } from './config/env.config.js';
import { envValidationSchema } from './config/env.validation.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { BillboardModule } from './modules/billboard/billboard.module.js';
import { IdentityModule } from './modules/identity/identity.module.js';
import { SalesModule } from './modules/sales/sales.module.js';
import { SecurityModule } from './modules/security/security.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, securityConfig, appConfig],
      validationSchema: envValidationSchema,
    }),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: seconds(60),
          limit: 30,
        },
      ],
      errorMessage: 'Demasiadas solicitudes. Intente más tarde',
    }),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'estatico'),
      serveRoot: '/estatico',
      exclude: ['/api/(.*)'],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const isDev = configService.get<string>('database.environment') === 'development';

        return {
          type: 'postgres',
          host: configService.get<string>('database.host'),
          port: configService.get<number>('database.port'),
          username: configService.get<string>('database.username'),
          password: configService.get<string>('database.password'),
          database: configService.get<string>('database.name'),
          autoLoadEntities: true,
          logging: isDev,
        };
      },
      async dataSourceFactory(options) {
        if (!options) {
          throw new Error('Invalid options passed');
        }

        return addTransactionalDataSource(new DataSource(options));
      },
    }),
    IdentityModule,
    SecurityModule,
    AuthModule,
    BillboardModule,
    SalesModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
