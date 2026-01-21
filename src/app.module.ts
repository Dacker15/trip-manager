import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AuthModule } from '@auth/auth.module'
import { getTypeOrmConfig } from '@providers/database/typeorm.config'
import { ProvidersModule } from '@providers/providers.module'
import { TripsModule } from '@trips/trips.module'

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: getTypeOrmConfig,
    }),
    TripsModule,
    ProvidersModule,
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
