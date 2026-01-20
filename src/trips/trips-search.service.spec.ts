import { BadRequestException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { TripsApiService } from '@apis/trips-api/trips-api.service'
import { SortStrategy } from '@common/enums/sorting-strategy.enum'
import { TripTypology } from '@common/enums/trip-typology.enum'
import { Trip } from '@common/interfaces/trip.interface'
import { Airport } from '@common/types/airport'
import { TripsSearchService } from './trips-search.service'

/* eslint-disable @typescript-eslint/unbound-method */
describe('TripsSearchService', () => {
  let service: TripsSearchService
  let tripsApiService: TripsApiService

  const ids = [
    '123e4567-e89b-12d3-a456-426614174000',
    '223e4567-e89b-12d3-a456-426614174001',
    '323e4567-e89b-12d3-a456-426614174002',
  ]
  const origin: Airport = 'ATL'
  const destination: Airport = 'JFK'

  const mockTrips: Trip[] = [
    {
      id: ids[0],
      origin,
      destination,
      cost: 300,
      duration: 120,
      type: TripTypology.FLIGHT,
      display_name: 'Atlanta to New York',
    },
    {
      id: ids[1],
      origin,
      destination,
      cost: 150,
      duration: 180,
      type: TripTypology.FLIGHT,
      display_name: 'Atlanta to New York (Budget)',
    },
    {
      id: ids[2],
      origin,
      destination,
      cost: 450,
      duration: 90,
      type: TripTypology.FLIGHT,
      display_name: 'Atlanta to New York (Express)',
    },
  ]

  beforeEach(async () => {
    const mockTripsApiService = {
      findMany: jest.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TripsSearchService,
        {
          provide: TripsApiService,
          useValue: mockTripsApiService,
        },
      ],
    }).compile()

    service = module.get<TripsSearchService>(TripsSearchService)
    tripsApiService = module.get<TripsApiService>(TripsApiService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('findMany', () => {
    it('should return trips sorted by cost when using CHEAPEST strategy', async () => {
      jest.spyOn(tripsApiService, 'findMany').mockResolvedValue({
        data: [...mockTrips],
      } as any)

      const result = await service.findMany(
        origin,
        destination,
        SortStrategy.CHEAPEST,
      )

      expect(tripsApiService.findMany).toHaveBeenCalledWith(origin, destination)
      expect(result).toHaveLength(3)
      expect(result[0].cost).toBe(150)
      expect(result[1].cost).toBe(300)
      expect(result[2].cost).toBe(450)
      expect(result[0].id).toBe('223e4567-e89b-12d3-a456-426614174001')
      expect(result[1].id).toBe('123e4567-e89b-12d3-a456-426614174000')
      expect(result[2].id).toBe('323e4567-e89b-12d3-a456-426614174002')
    })

    it('should return trips sorted by duration when using FASTEST strategy', async () => {
      jest.spyOn(tripsApiService, 'findMany').mockResolvedValue({
        data: [...mockTrips],
      } as any)

      const result = await service.findMany(
        origin,
        destination,
        SortStrategy.FASTEST,
      )

      expect(tripsApiService.findMany).toHaveBeenCalledWith(origin, destination)
      expect(result).toHaveLength(3)
      expect(result[0].duration).toBe(90)
      expect(result[1].duration).toBe(120)
      expect(result[2].duration).toBe(180)
      expect(result[0].id).toBe(ids[2])
      expect(result[1].id).toBe(ids[0])
      expect(result[2].id).toBe(ids[1])
    })

    it('should throw BadRequestException when origin and destination are the same', async () => {
      await expect(
        service.findMany(origin, origin, SortStrategy.CHEAPEST),
      ).rejects.toThrow(BadRequestException)

      await expect(
        service.findMany(origin, origin, SortStrategy.CHEAPEST),
      ).rejects.toThrow('Origin and destination cannot be the same')

      expect(tripsApiService.findMany).not.toHaveBeenCalled()
    })

    it('should handle empty response from API', async () => {
      jest.spyOn(tripsApiService, 'findMany').mockResolvedValue({
        data: [],
      } as any)

      const result = await service.findMany(
        origin,
        destination,
        SortStrategy.CHEAPEST,
      )

      expect(tripsApiService.findMany).toHaveBeenCalledWith(origin, destination)
      expect(result).toHaveLength(0)
      expect(result).toEqual([])
    })
  })
})
