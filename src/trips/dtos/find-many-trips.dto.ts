import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsEnum, IsIn, IsOptional } from 'class-validator'
import { AVAILABLE_AIRPORTS } from '@common/airports/available'
import { SortStrategy } from '@common/enums/sorting-strategy.enum'
import { type Airport } from '@common/types/airport'

export class FindManyTripsDto {
  @ApiProperty({
    type: String,
    enum: AVAILABLE_AIRPORTS,
    description: 'IATA 3 letter code of the origin',
  })
  @IsIn(AVAILABLE_AIRPORTS, {
    message: 'origin must be one of the allowed airports',
  })
  origin: Airport

  @ApiProperty({
    type: String,
    enum: AVAILABLE_AIRPORTS,
    description: 'IATA 3 letter code of the destination',
  })
  @IsIn(AVAILABLE_AIRPORTS, {
    message: 'destination must be one of the allowed airports',
  })
  destination: Airport

  @ApiPropertyOptional({
    default: SortStrategy.FASTEST,
    type: String,
    enum: SortStrategy,
    description: 'Sorting strategy for the trips',
  })
  @IsOptional()
  @IsEnum(SortStrategy, {
    message: 'sort_by must be a valid sorting strategy',
  })
  sort_by: SortStrategy = SortStrategy.FASTEST
}
