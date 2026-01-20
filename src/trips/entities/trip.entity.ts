import { ApiProperty } from '@nestjs/swagger'
import { AVAILABLE_AIRPORTS } from '@common/airports/available'
import { TripTypology } from '@common/enums/trip-typology.enum'
import { Trip as ITrip } from '@common/interfaces/trip.interface'
import { type Airport } from '@common/types/airport'

export class Trip implements ITrip {
  @ApiProperty({
    description: 'Unique identifier for the trip',
    type: String,
    format: 'uuid',
  })
  id: string

  @ApiProperty({
    type: String,
    description: 'IATA origin airport code',
    enum: AVAILABLE_AIRPORTS,
  })
  origin: Airport

  @ApiProperty({
    type: String,
    description: 'IATA destination airport code',
    enum: AVAILABLE_AIRPORTS,
  })
  destination: Airport

  @ApiProperty({
    type: Number,
    description: 'Cost of the trip',
  })
  cost: number

  @ApiProperty({
    type: Number,
    description: 'Duration of the trip',
  })
  duration: number

  @ApiProperty({
    type: String,
    description: 'Type of the trip',
    enum: TripTypology,
  })
  type: TripTypology

  @ApiProperty({
    type: String,
    description: 'Complete description of the trip',
  })
  display_name: string
}
