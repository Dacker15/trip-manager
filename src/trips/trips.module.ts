import { Module } from '@nestjs/common'
import { ProvidersModule } from '@providers/providers.module'
import { TripsSearchService } from './trips-search.service'
import { TripsStorageService } from './trips-storage.service'
import { TripsController } from './trips.controller'

@Module({
  imports: [ProvidersModule],
  providers: [TripsSearchService, TripsStorageService],
  controllers: [TripsController],
})
export class TripsModule {}
