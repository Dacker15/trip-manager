import { ApiProperty } from '@nestjs/swagger'
import { IsUUID } from 'class-validator'

export class SaveTripDto {
  @ApiProperty({
    type: String,
    format: 'uuid',
    description: 'Unique identifier for the trip',
  })
  @IsUUID('4', { message: 'tripId must be a valid UUID v4' })
  tripId: string
}
