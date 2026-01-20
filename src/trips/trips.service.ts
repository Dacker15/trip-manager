import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common'
import { AxiosError } from 'axios'
import { TripsApiService } from '@apis/trips-api/trips-api.service'
import { SortStrategy } from '@common/enums/sorting-strategy.enum'
import { Trip } from '@common/interfaces/trip.interface'
import { Airport } from '@common/types/airport'

const SORT_STRATEGY_KEY: Record<SortStrategy, keyof Trip> = {
  [SortStrategy.CHEAPEST]: 'cost',
  [SortStrategy.FASTEST]: 'duration',
} as const

@Injectable()
export class TripsService {
  private readonly logger = new Logger(TripsService.name)

  constructor(private readonly tripsApiService: TripsApiService) {}

  async findMany(origin: Airport, destination: Airport, sortBy: SortStrategy) {
    // Verify that origin and destination are not the same
    if (origin === destination) {
      throw new BadRequestException('Origin and destination cannot be the same')
    }

    try {
      const response = await this.tripsApiService.findMany(origin, destination)
      const sortKey = SORT_STRATEGY_KEY[sortBy]

      return response.data.sort((a, b) => {
        if (a[sortKey] < b[sortKey]) return -1
        if (a[sortKey] > b[sortKey]) return 1
        return 0
      })
    } catch (_error) {
      const error = _error as AxiosError
      this.logger.error(
        `Failed to fetch trips from external API: ${error.message}`,
      )
      throw new InternalServerErrorException(error.message)
    }
  }
}
