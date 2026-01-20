import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { TripsModule } from '@trips/trips.module'
import { ApisModule } from '@apis/apis.module'

@Module({
  imports: [ConfigModule.forRoot(), ApisModule, TripsModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
