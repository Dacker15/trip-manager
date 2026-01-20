import { Module } from '@nestjs/common'
import { ApisModule } from '@apis/apis.module'
import { TripsController } from './trips.controller'
import { TripsService } from './trips.service'

@Module({
  imports: [ApisModule],
  providers: [TripsService],
  controllers: [TripsController],
})
export class TripsModule {}
