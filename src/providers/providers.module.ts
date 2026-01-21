import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { TripsApiService } from './trips-api/trips-api.service'

@Module({
  imports: [ConfigModule],
  providers: [TripsApiService],
  exports: [TripsApiService],
})
export class ProvidersModule {}
