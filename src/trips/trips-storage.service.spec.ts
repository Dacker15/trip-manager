import { InternalServerErrorException, Logger } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { AxiosError } from 'axios'
import { TripTypology } from '@common/enums/trip-typology.enum'
import { Trip } from '@common/interfaces/trip.interface'
import { TripsApiService } from '@providers/trips-api/trips-api.service'
import { TripsStorageService } from './trips-storage.service'

/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
describe('TripsStorageService', () => {
  let service: TripsStorageService
  let tripsApiService: jest.Mocked<TripsApiService>

  const mockTrip: Trip = {
    id: 'trip-1',
    origin: 'MAD',
    destination: 'BCN',
    cost: 100,
    duration: 120,
    type: TripTypology.FLIGHT,
    display_name: 'Madrid to Barcelona',
  }

  const mockTrip2: Trip = {
    id: 'trip-2',
    origin: 'BCN',
    destination: 'LHR',
    cost: 50,
    duration: 90,
    type: TripTypology.TRAIN,
    display_name: 'Barcelona to London',
  }

  const mockTrip3: Trip = {
    id: 'trip-3',
    origin: 'LHR',
    destination: 'MAD',
    cost: 75,
    duration: 100,
    type: TripTypology.CAR,
    display_name: 'London to Madrid',
  }

  beforeEach(async () => {
    const mockTripsApiService = {
      findOne: jest.fn(),
      findMany: jest.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TripsStorageService,
        {
          provide: TripsApiService,
          useValue: mockTripsApiService,
        },
      ],
    }).compile()

    service = module.get<TripsStorageService>(TripsStorageService)
    tripsApiService = module.get(TripsApiService)

    // Mock Logger methods to avoid console output during tests
    jest.spyOn(Logger.prototype, 'warn').mockImplementation()
    jest.spyOn(Logger.prototype, 'error').mockImplementation()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('save', () => {
    it('should save a new trip id and return true', () => {
      const tripId = 'trip-1'
      const result = service.save(tripId)

      expect(result).toBe(true)
    })

    it('should not save a duplicate trip id and return false', () => {
      const tripId = 'trip-1'
      service.save(tripId)
      const result = service.save(tripId)

      expect(result).toBe(false)
    })

    it('should save multiple different trip ids', () => {
      const result1 = service.save('trip-1')
      const result2 = service.save('trip-2')
      const result3 = service.save('trip-3')

      expect(result1).toBe(true)
      expect(result2).toBe(true)
      expect(result3).toBe(true)
    })
  })

  describe('delete', () => {
    it('should delete an existing trip id', () => {
      service.save('trip-1')
      const result = service.delete('trip-1')

      expect(result).toBe(true)
    })

    it('should do nothing when deleting a non-existent trip id', () => {
      const result = service.delete('trip-2')

      expect(result).toBe(false)
    })

    it('should delete from the middle of the list', () => {
      service.save('trip-1')
      service.save('trip-2')
      service.save('trip-3')

      const result = service.delete('trip-2')

      expect(result).toBe(true)
    })

    it('should delete all trips when called multiple times', () => {
      service.save('trip-1')
      service.save('trip-2')
      service.save('trip-3')

      const firstResult = service.delete('trip-1')
      const secondResult = service.delete('trip-2')
      const thirdResult = service.delete('trip-3')

      expect(firstResult).toBe(true)
      expect(secondResult).toBe(true)
      expect(thirdResult).toBe(true)
    })
  })

  describe('findAll', () => {
    beforeEach(() => {
      // Reset the service to clear any saved trips
      service['trips'] = []
    })

    it('should return an empty array when no trips are stored', async () => {
      const result = await service.findAll(10, 0)

      expect(result).toEqual([])
      expect(tripsApiService.findOne).not.toHaveBeenCalled()
    })

    it('should fetch and return all trips when take is greater than stored trips', async () => {
      service.save('trip-1')
      service.save('trip-2')

      tripsApiService.findOne
        .mockResolvedValueOnce({ data: mockTrip } as any)
        .mockResolvedValueOnce({ data: mockTrip2 } as any)

      const result = await service.findAll(10, 0)

      expect(result).toEqual([mockTrip, mockTrip2])
      expect(tripsApiService.findOne).toHaveBeenCalledTimes(2)
      expect(tripsApiService.findOne).toHaveBeenCalledWith('trip-1')
      expect(tripsApiService.findOne).toHaveBeenCalledWith('trip-2')
    })

    it('should respect the take parameter', async () => {
      service.save('trip-1')
      service.save('trip-2')
      service.save('trip-3')

      tripsApiService.findOne
        .mockResolvedValueOnce({ data: mockTrip } as any)
        .mockResolvedValueOnce({ data: mockTrip2 } as any)

      const result = await service.findAll(2, 0)

      expect(result).toEqual([mockTrip, mockTrip2])
      expect(tripsApiService.findOne).toHaveBeenCalledTimes(2)
      expect(tripsApiService.findOne).toHaveBeenCalledWith('trip-1')
      expect(tripsApiService.findOne).toHaveBeenCalledWith('trip-2')
    })

    it('should respect the skip parameter', async () => {
      service.save('trip-1')
      service.save('trip-2')
      service.save('trip-3')

      tripsApiService.findOne
        .mockResolvedValueOnce({ data: mockTrip2 } as any)
        .mockResolvedValueOnce({ data: mockTrip3 } as any)

      const result = await service.findAll(10, 1)

      expect(result).toEqual([mockTrip2, mockTrip3])
      expect(tripsApiService.findOne).toHaveBeenCalledTimes(2)
      expect(tripsApiService.findOne).toHaveBeenCalledWith('trip-2')
      expect(tripsApiService.findOne).toHaveBeenCalledWith('trip-3')
    })

    it('should handle pagination correctly with both take and skip', async () => {
      service.save('trip-1')
      service.save('trip-2')
      service.save('trip-3')

      tripsApiService.findOne.mockResolvedValueOnce({ data: mockTrip2 } as any)

      const result = await service.findAll(1, 1)

      expect(result).toEqual([mockTrip2])
      expect(tripsApiService.findOne).toHaveBeenCalledTimes(1)
      expect(tripsApiService.findOne).toHaveBeenCalledWith('trip-2')
    })

    it('should return only successful responses when some requests fail', async () => {
      service.save('trip-1')
      service.save('trip-2')
      service.save('trip-3')

      tripsApiService.findOne
        .mockResolvedValueOnce({ data: mockTrip } as any)
        .mockRejectedValueOnce(new Error('API Error'))
        .mockResolvedValueOnce({ data: mockTrip3 } as any)

      const result = await service.findAll(10, 0)

      expect(result).toEqual([mockTrip, mockTrip3])
      expect(tripsApiService.findOne).toHaveBeenCalledTimes(3)
    })

    it('should log warning when some trips fail to fetch', async () => {
      const loggerWarnSpy = jest.spyOn(Logger.prototype, 'warn')

      service.save('trip-1')
      service.save('trip-2')

      tripsApiService.findOne
        .mockResolvedValueOnce({ data: mockTrip } as any)
        .mockRejectedValueOnce(new Error('API Error'))

      await service.findAll(10, 0)

      expect(loggerWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          'Some trips could not be fetched from external API',
        ),
      )
    })

    it('should log error and throw InternalServerErrorException when Promise.allSettled throws', async () => {
      const loggerErrorSpy = jest.spyOn(Logger.prototype, 'error')

      service.save('trip-1')

      const axiosError = new Error('Network Error') as AxiosError

      // Mock Promise.allSettled to throw
      jest.spyOn(Promise, 'allSettled').mockRejectedValueOnce(axiosError)

      await expect(service.findAll(10, 0)).rejects.toThrow(
        InternalServerErrorException,
      )

      expect(loggerErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to fetch trips from external API'),
      )
    })

    it('should return empty array when skip is beyond the stored trips', async () => {
      service.save('trip-1')
      service.save('trip-2')

      const result = await service.findAll(10, 5)

      expect(result).toEqual([])
      expect(tripsApiService.findOne).not.toHaveBeenCalled()
    })

    it('should handle take of 0', async () => {
      service.save('trip-1')
      service.save('trip-2')

      const result = await service.findAll(0, 0)

      expect(result).toEqual([])
      expect(tripsApiService.findOne).not.toHaveBeenCalled()
    })
  })
})
