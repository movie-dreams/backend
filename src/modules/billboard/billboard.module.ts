import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// ORM Entities
import { Movie as MovieOrmEntity } from './infrastructure/entities/movie.orm-entity.js';
import { MovieImage as MovieImageOrmEntity } from './infrastructure/entities/movie-image.orm-entity.js';
import { Room as RoomOrmEntity } from './infrastructure/entities/room.orm-entity.js';
import { Seat as SeatOrmEntity } from './infrastructure/entities/seat.orm-entity.js';
import { Showtime as ShowtimeOrmEntity } from './infrastructure/entities/showtime.orm-entity.js';

// Domain Repositories (Tokens)
import { MovieRepository } from './domain/repositories/movie.repository.js';
import { RoomRepository } from './domain/repositories/room.repository.js';
import { SeatRepository } from './domain/repositories/seat.repository.js';
import { ShowtimeRepository } from './domain/repositories/showtime.repository.js';
import { BillboardQueryRepository } from './domain/repositories/billboard-query.repository.js';

// Infrastructure Persistence
import { TypeOrmMovieRepository } from './infrastructure/persistence/typeorm-movie.repository.js';
import { TypeOrmRoomRepository } from './infrastructure/persistence/typeorm-room.repository.js';
import { TypeOrmSeatRepository } from './infrastructure/persistence/typeorm-seat.repository.js';
import { TypeOrmShowtimeRepository } from './infrastructure/persistence/typeorm-showtime.repository.js';
import { TypeOrmBillboardQueryRepository } from './infrastructure/persistence/typeorm-billboard-query.repository.js';

// Application Services
import { MovieService } from './application/services/movie.service.js';
import { RoomService } from './application/services/room.service.js';
import { SeatService } from './application/services/seat.service.js';
import { ShowtimeService } from './application/services/showtime.service.js';
import { BillboardService } from './application/services/billboard.service.js';
import { FilesService } from './application/services/files.service.js';

// Presentation Controllers
import { MovieController } from './presentation/controllers/movie.controller.js';
import { RoomController } from './presentation/controllers/room.controller.js';
import { SeatController } from './presentation/controllers/seat.controller.js';
import { ShowtimeController } from './presentation/controllers/showtime.controller.js';
import { BillboardController } from './presentation/controllers/billboard.controller.js';
import { FilesController } from './presentation/controllers/files.controller.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MovieOrmEntity,
      MovieImageOrmEntity,
      RoomOrmEntity,
      SeatOrmEntity,
      ShowtimeOrmEntity,
    ]),
  ],
  controllers: [
    MovieController,
    RoomController,
    SeatController,
    ShowtimeController,
    BillboardController,
    FilesController,
  ],
  providers: [
    MovieService,
    RoomService,
    SeatService,
    ShowtimeService,
    BillboardService,
    FilesService,
    {
      provide: MovieRepository,
      useClass: TypeOrmMovieRepository,
    },
    {
      provide: RoomRepository,
      useClass: TypeOrmRoomRepository,
    },
    {
      provide: SeatRepository,
      useClass: TypeOrmSeatRepository,
    },
    {
      provide: ShowtimeRepository,
      useClass: TypeOrmShowtimeRepository,
    },
    {
      provide: BillboardQueryRepository,
      useClass: TypeOrmBillboardQueryRepository,
    },
  ],
  exports: [
    MovieService,
    RoomService,
    SeatService,
    ShowtimeService,
    BillboardService,
    FilesService,
    ShowtimeRepository,
    SeatRepository,
    RoomRepository,
    MovieRepository,
  ],
})
export class BillboardModule {}