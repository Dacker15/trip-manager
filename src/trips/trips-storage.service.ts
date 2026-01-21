import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common'
import { AxiosError } from 'axios'
import { TripsApiService } from '@apis/trips-api/trips-api.service'

@Injectable()
export class TripsStorageService {
  // Simulated in-memory storage for trips identifiers
  private trips: string[] = []

  private readonly logger = new Logger(TripsStorageService.name)

  constructor(private tripsApiService: TripsApiService) {}

  async findAll(take: number, skip: number) {
    const tripIds = this.trips.slice(skip, skip + take)
    const promises = tripIds.map((tripId) =>
      this.tripsApiService.findOne(tripId),
    )
    try {
      const responses = await Promise.allSettled(promises)
      const successfulResponses = responses.filter(
        (response) => response.status === 'fulfilled',
      )

      // Log warning for failed requests
      if (successfulResponses.length !== promises.length) {
        const failedTripIds = tripIds.filter((_, index) => {
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

  save(tripId: string) {
    if (!this.trips.includes(tripId)) {
      this.trips.push(tripId)
      return true
    }
    return false
  }

  delete(tripId: string) {
    const index = this.trips.indexOf(tripId)
    if (index !== -1) {
      this.trips.splice(index, 1)
      return true
    }
    return false
  }
}
