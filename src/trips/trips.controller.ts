import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  Res,
} from '@nestjs/common'
import {
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiTags,
  ApiInternalServerErrorResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiParam,
} from '@nestjs/swagger'
import { type Response } from 'express'
import { FindAllTripsDto } from './dtos/find-all-trips.dto'
import { FindManyTripsDto } from './dtos/find-many-trips.dto'
import { SaveTripDto } from './dtos/save-trip.dto'
import { Trip } from './entities/trip.entity'
import { TripsSearchService } from './trips-search.service'
import { TripsStorageService } from './trips-storage.service'

@Controller('trips')
@ApiTags('Trips')
export class TripsController {
  constructor(
    private readonly tripsSearchService: TripsSearchService,
    private readonly tripsStorageService: TripsStorageService,
  ) {}

  @Get('search')
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

  @Get()
  @ApiOkResponse({ type: Trip, isArray: true })
  @ApiBadRequestResponse({
    description: 'take and skip must be non-negative numbers',
  })
  @ApiInternalServerErrorResponse()
  findAll(@Query() params: FindAllTripsDto) {
    return this.tripsStorageService.findAll(params.take, params.skip)
  }

  @Post()
  @ApiCreatedResponse({ description: 'Trip saved successfully' })
  @ApiNoContentResponse({ description: 'Trip already exists' })
  @ApiBadRequestResponse({ description: 'tripId must be a valid UUID v4' })
  save(@Body() body: SaveTripDto, @Res() response: Response) {
    const isNew = this.tripsStorageService.save(body.tripId)
    if (isNew) {
      return response.status(201).send()
    }
    return response.status(204).send()
  }

  @Delete(':tripId')
  @ApiParam({ name: 'tripId', type: 'string', format: 'uuid' })
  @ApiOkResponse({ description: 'Trip deleted successfully' })
  @ApiNoContentResponse({ description: 'Trip not found' })
  @ApiBadRequestResponse({ description: 'tripId must be a valid UUID v4' })
  delete(
    @Param('tripId', new ParseUUIDPipe({ version: '4' })) tripId: string,
    @Res() response: Response,
  ) {
    const isDeleted = this.tripsStorageService.delete(tripId)
    if (isDeleted) {
      return response.status(200).send()
    }
    return response.status(204).send()
  }
}
