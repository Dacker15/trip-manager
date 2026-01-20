import { Controller, Get, Query } from '@nestjs/common'
import {
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiTags,
  ApiInternalServerErrorResponse,
} from '@nestjs/swagger'
import { Trip } from '@trips/entities/trip.entity'
import { FindManyTripsDto } from './dtos/find-many-trips.dto'
import { TripsService } from './trips.service'

@Controller('trips')
@ApiTags('Trips')
export class TripsController {
  constructor(private readonly tripsService: TripsService) {}

  @Get()
  @ApiOkResponse({ type: Trip, isArray: true })
  @ApiBadRequestResponse({
    description: 'Origin and destination cannot be the same',
  })
  @ApiInternalServerErrorResponse()
  findMany(@Query() params: FindManyTripsDto) {
    return this.tripsService.findMany(
      params.origin,
      params.destination,
      params.sort_by,
    )
  }
}
