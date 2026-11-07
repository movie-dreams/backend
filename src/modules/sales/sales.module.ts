import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BillboardModule } from '../billboard/billboard.module.js';

// ORM Entities
import { Reservation as ReservationOrmEntity } from './infrastructure/entities/reservation.orm-entity.js';
import { ReservationDetail as ReservationDetailOrmEntity } from './infrastructure/entities/reservation-detail.orm-entity.js';

// Domain Repositories (Tokens)
import { ReservationRepository } from './domain/repositories/reservation.repository.js';
import { ReservationDetailRepository } from './domain/repositories/reservation-detail.repository.js';

// Infrastructure Persistence
import { TypeOrmReservationRepository } from './infrastructure/persistence/typeorm-reservation.repository.js';
import { TypeOrmReservationDetailRepository } from './infrastructure/persistence/typeorm-reservation-detail.repository.js';

// Application Services
import { ReservationService } from './application/services/reservation.service.js';
import { ReservationDetailService } from './application/services/reservation-detail.service.js';

// Presentation Controllers
import { ReservationController } from './presentation/controllers/reservation.controller.js';
import { ReservationDetailController } from './presentation/controllers/reservation-detail.controller.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ReservationOrmEntity,
      ReservationDetailOrmEntity,
    ]),
    BillboardModule,
  ],
  controllers: [
    ReservationController,
    ReservationDetailController,
  ],
  providers: [
    ReservationService,
    ReservationDetailService,
    {
      provide: ReservationRepository,
      useClass: TypeOrmReservationRepository,
    },
    {
      provide: ReservationDetailRepository,
      useClass: TypeOrmReservationDetailRepository,
    },
  ],
  exports: [ReservationService, ReservationDetailService],
})
export class SalesModule {}
