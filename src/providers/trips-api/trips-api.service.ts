import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import axios, { AxiosInstance } from 'axios'
import { Trip } from '@common/interfaces/trip.interface'

@Injectable()
export class TripsApiService {
  private readonly httpClientInstance: AxiosInstance

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('API_KEY')
    if (!apiKey) {
      throw new Error('API_KEY was not provided in configuration file')
    }
    this.httpClientInstance = axios.create({
      baseURL: 'https://z0qw1e7jpd.execute-api.eu-west-1.amazonaws.com/default',
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
