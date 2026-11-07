import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IdentityModule } from '../identity/identity.module.js';

// ORM Entities
import { Role as RoleOrmEntity } from './infrastructure/entities/role.orm-entity.js';
import { User as UserOrmEntity } from './infrastructure/entities/user.orm-entity.js';
import { UserRole as UserRoleOrmEntity } from './infrastructure/entities/user-role.orm-entity.js';

// Domain Repositories (Tokens)
import { RoleRepository } from './domain/repositories/role.repository.js';
import { UserRepository } from './domain/repositories/user.repository.js';
import { UserRoleRepository } from './domain/repositories/user-role.repository.js';

// Infrastructure Persistence
import { TypeOrmRoleRepository } from './infrastructure/persistence/typeorm-role.repository.js';
import { TypeOrmUserRepository } from './infrastructure/persistence/typeorm-user.repository.js';
import { TypeOrmUserRoleRepository } from './infrastructure/persistence/typeorm-user-role.repository.js';

// Application Services
import { RoleService } from './application/services/role.service.js';
import { UserService } from './application/services/user.service.js';
import { UserRoleService } from './application/services/user-role.service.js';

// Presentation Controllers
import { RoleController } from './presentation/controllers/role.controller.js';
import { UserController } from './presentation/controllers/user.controller.js';
import { UserRoleController } from './presentation/controllers/user-role.controller.js';

@Module({
  imports: [
    IdentityModule,
    TypeOrmModule.forFeature([
      RoleOrmEntity,
      UserOrmEntity,
      UserRoleOrmEntity,
    ]),
  ],
  controllers: [
    RoleController,
    UserController,
    UserRoleController,
  ],
  providers: [
    RoleService,
    UserService,
    UserRoleService,
    {
      provide: RoleRepository,
      useClass: TypeOrmRoleRepository,
    },
    {
      provide: UserRepository,
      useClass: TypeOrmUserRepository,
    },
    {
      provide: UserRoleRepository,
      useClass: TypeOrmUserRoleRepository,
    },
  ],
  exports: [
    RoleService,
    UserService,
    UserRoleService,
    RoleRepository,
    UserRepository,
    UserRoleRepository,
  ],
})
export class SecurityModule {}
