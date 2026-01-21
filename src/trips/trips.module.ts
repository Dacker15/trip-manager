import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ProvidersModule } from '@providers/providers.module'
import { SavedTrip } from '@trips/entities/saved-trip.entity'
import { TripsSearchService } from './trips-search.service'
import { TripsStorageService } from './trips-storage.service'
import { TripsController } from './trips.controller'

@Module({
  imports: [ProvidersModule, TypeOrmModule.forFeature([SavedTrip])],
  providers: [TripsSearchService, TripsStorageService],
  controllers: [TripsController],
})
export class TripsModule {}
