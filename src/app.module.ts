import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { getTypeOrmConfig } from '@providers/database/typeorm.config'
import { ProvidersModule } from '@providers/providers.module'
import { TripsModule } from '@trips/trips.module'
import { UsersModule } from '@users/user.module'

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
    UsersModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
