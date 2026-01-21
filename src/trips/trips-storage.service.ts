import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { AxiosError } from 'axios'
import { Repository } from 'typeorm'
import { SavedTrip } from '@providers/database/entities/saved-trip.entity'
import { TripsApiService } from '@providers/trips-api/trips-api.service'

@Injectable()
export class TripsStorageService {
  private readonly logger = new Logger(TripsStorageService.name)

  constructor(
    @InjectRepository(SavedTrip)
    private savedTripRepository: Repository<SavedTrip>,
    private tripsApiService: TripsApiService,
  ) {}

  async findAll(take: number, skip: number, loggedUserId: number) {
    const savedTrips = await this.savedTripRepository.find({
      where: { userId: loggedUserId },
      take: take,
      skip: skip,
    })
    const tripsIds = savedTrips.map((savedTrip) => savedTrip.tripId)

    const promises = tripsIds.map((tripId) =>
      this.tripsApiService.findOne(tripId),
    )
    try {
      const responses = await Promise.allSettled(promises)
      const successfulResponses = responses.filter(
        (response) => response.status === 'fulfilled',
      )

      // Log warning for failed requests
      if (successfulResponses.length !== promises.length) {
        const failedTripIds = tripsIds.filter((_, index) => {
          return responses[index].status === 'rejected'
        })
        this.logger.warn(
          `Some trips could not be fetched from external API: ${failedTripIds.join(', ')}`,
        )
      }

      return successfulResponses.map((response) => response.value.data)
    } catch (_error) {
      const error = _error as AxiosError
      this.logger.error(
        `Failed to fetch trips from external API: ${error.message}`,
      )
      throw new InternalServerErrorException(error.message)
    }
  }

  async save(tripId: string, userId: number) {
    const existingSavedTrip = await this.savedTripRepository.findOne({
      where: { tripId: tripId, userId: userId },
      select: ['id'],
    })

    if (existingSavedTrip !== null) {
      return false
    }
    await this.savedTripRepository.save({
      tripId,
      userId,
    })
    return true
  }

  async delete(tripId: string, userId: number) {
    const existingSavedTrip = await this.savedTripRepository.findOne({
      where: { tripId: tripId, userId: userId },
      select: ['id'],
    })

    if (existingSavedTrip === null) {
      return false
    }

    await this.savedTripRepository.delete({ tripId: tripId, userId: userId })
    return true
  }
}
