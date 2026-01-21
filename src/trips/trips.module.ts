import { Module } from '@nestjs/common'
import { ApisModule } from '@apis/apis.module'
import { TripsSearchService } from './trips-search.service'
import { TripsStorageService } from './trips-storage.service'
import { TripsController } from './trips.controller'

@Module({
  imports: [ApisModule],
  providers: [TripsSearchService, TripsStorageService],
  controllers: [TripsController],
})
export class TripsModule {}
