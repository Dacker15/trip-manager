import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import axios, { AxiosInstance } from 'axios'
import { Trip } from '@common/interfaces/trip.interface'

@Injectable()
export class TripsApiService {
  private readonly httpClientInstance: AxiosInstance

  constructor(private readonly configService: ConfigService) {
    const baseUrl = this.configService.getOrThrow<string>('API_BASE_URL')
    const apiKey = this.configService.getOrThrow<string>('API_KEY')
    if (!apiKey) {
      throw new Error('API_KEY was not provided in configuration file')
    }
    this.httpClientInstance = axios.create({
      baseURL: baseUrl,
      headers: { 'x-api-key': apiKey },
    })
  }

  findMany(origin: string, destination: string) {
    return this.httpClientInstance.get<Trip[]>('/trips', {
      params: { origin, destination },
    })
  }

  findOne(tripId: string) {
    return this.httpClientInstance.get<Trip>(`/trips/${tripId}`)
  }
}
