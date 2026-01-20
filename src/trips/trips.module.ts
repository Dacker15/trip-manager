import { Module } from '@nestjs/common'
import { ApisModule } from '@apis/apis.module'
import { TripsSearchService } from './trips-search.service'
import { TripsController } from './trips.controller'

@Module({
  imports: [ApisModule],
  providers: [TripsSearchService],
  controllers: [TripsController],
})
export class TripsModule {}
