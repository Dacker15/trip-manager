import { Controller, Get, Query } from '@nestjs/common'
import {
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiTags,
  ApiInternalServerErrorResponse,
} from '@nestjs/swagger'
import { FindManyTripsDto } from './dtos/find-many-trips.dto'
import { Trip } from './entities/trip.entity'
import { TripsSearchService } from './trips-search.service'

@Controller('trips')
@ApiTags('Trips')
export class TripsController {
  constructor(private readonly tripsSearchService: TripsSearchService) {}

  @Get()
  @ApiOkResponse({ type: Trip, isArray: true })
  @ApiBadRequestResponse({
    description: 'Origin and destination cannot be the same',
  })
  @ApiInternalServerErrorResponse()
  findMany(@Query() params: FindManyTripsDto) {
    return this.tripsSearchService.findMany(
      params.origin,
      params.destination,
      params.sort_by,
    )
  }
}
