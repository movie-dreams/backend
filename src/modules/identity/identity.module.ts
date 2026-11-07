import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// ORM Entities
import { Person as PersonOrmEntity } from './infrastructure/entities/person.orm-entity.js';
import { Client as ClientOrmEntity } from './infrastructure/entities/client.orm-entity.js';

// Domain Repositories (Tokens)
import { PersonRepository } from './domain/repositories/person.repository.js';
import { ClientRepository } from './domain/repositories/client.repository.js';

// Infrastructure Persistence
import { TypeOrmPersonRepository } from './infrastructure/persistence/typeorm-person.repository.js';
import { TypeOrmClientRepository } from './infrastructure/persistence/typeorm-client.repository.js';

// Application Services
import { PersonService } from './application/services/person.service.js';
import { ClientService } from './application/services/client.service.js';

// Presentation Controllers
import { PersonController } from './presentation/controllers/person.controller.js';
import { ClientController } from './presentation/controllers/client.controller.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([PersonOrmEntity, ClientOrmEntity]),
  ],
  controllers: [PersonController, ClientController],
  providers: [
    PersonService,
    ClientService,
    {
      provide: PersonRepository,
      useClass: TypeOrmPersonRepository,
    },
    {
      provide: ClientRepository,
      useClass: TypeOrmClientRepository,
    },
  ],
  exports: [PersonService, ClientService],
})
export class IdentityModule {}
