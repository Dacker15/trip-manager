import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ProvidersModule } from '@providers/providers.module'
import { TripsModule } from '@trips/trips.module'

@Module({
  imports: [ConfigModule.forRoot(), TripsModule, ProvidersModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
