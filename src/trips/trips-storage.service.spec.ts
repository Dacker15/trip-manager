import { Logger, NotFoundException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { TripTypology } from '@common/enums/trip-typology.enum'
import { Trip } from '@common/interfaces/trip.interface'
import { SavedTrip } from '@providers/database/entities/saved-trip.entity'
import { TripsApiService } from '@providers/trips-api/trips-api.service'
import { TripsStorageService } from './trips-storage.service'

/* eslint-disable @typescript-eslint/unbound-method */
describe('TripsStorageService', () => {
  let service: TripsStorageService
  let savedTripRepository: Repository<SavedTrip>
  let tripsApiService: TripsApiService

  const mockSavedTripRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  }

  const mockTripsApiService = {
    findOne: jest.fn(),
    findMany: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TripsStorageService,
        {
          provide: getRepositoryToken(SavedTrip),
          useValue: mockSavedTripRepository,
        },
        {
          provide: TripsApiService,
          useValue: mockTripsApiService,
        },
      ],
    }).compile()

    service = module.get<TripsStorageService>(TripsStorageService)
    savedTripRepository = module.get<Repository<SavedTrip>>(
      getRepositoryToken(SavedTrip),
    )
    tripsApiService = module.get<TripsApiService>(TripsApiService)

    jest.spyOn(Logger.prototype, 'warn').mockImplementation()
    jest.spyOn(Logger.prototype, 'error').mockImplementation()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('findAll', () => {
    const mockUserId = 1
    const mockTake = 10
    const mockSkip = 0

    const mockSavedTrips: SavedTrip[] = [
      {
        id: 1,
        tripId: 'trip-uuid-1',
        userId: mockUserId,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as SavedTrip,
      {
        id: 2,
        tripId: 'trip-uuid-2',
        userId: mockUserId,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as SavedTrip,
    ]

    const mockTrip1: Trip = {
      id: 'trip-uuid-1',
      origin: 'LHR',
      destination: 'CDG',
      cost: 150,
      duration: 120,
      type: TripTypology.FLIGHT,
      display_name: 'London to Paris',
    }

    const mockTrip2: Trip = {
      id: 'trip-uuid-2',
      origin: 'CDG',
      destination: 'LHR',
      cost: 100,
      duration: 90,
      type: TripTypology.FLIGHT,
      display_name: 'Paris to London',
    }

    it('should return all trips for a user successfully', async () => {
      mockSavedTripRepository.find.mockResolvedValue(mockSavedTrips)
      mockTripsApiService.findOne
        .mockResolvedValueOnce({ data: mockTrip1 })
        .mockResolvedValueOnce({ data: mockTrip2 })

      const result = await service.findAll(mockTake, mockSkip, mockUserId)

      expect(savedTripRepository.find).toHaveBeenCalledWith({
        where: { userId: mockUserId },
        take: mockTake,
        skip: mockSkip,
      })
      expect(tripsApiService.findOne).toHaveBeenCalledTimes(2)
      expect(tripsApiService.findOne).toHaveBeenCalledWith('trip-uuid-1')
      expect(tripsApiService.findOne).toHaveBeenCalledWith('trip-uuid-2')
      expect(result).toEqual([mockTrip1, mockTrip2])
    })

    it('should return empty array when user has no saved trips', async () => {
      mockSavedTripRepository.find.mockResolvedValue([])

      const result = await service.findAll(mockTake, mockSkip, mockUserId)

      expect(savedTripRepository.find).toHaveBeenCalledWith({
        where: { userId: mockUserId },
        take: mockTake,
        skip: mockSkip,
      })
      expect(tripsApiService.findOne).not.toHaveBeenCalled()
      expect(result).toEqual([])
    })

    it('should handle partial failures when fetching trips from external API', async () => {
      mockSavedTripRepository.find.mockResolvedValue(mockSavedTrips)
      mockTripsApiService.findOne
        .mockResolvedValueOnce({ data: mockTrip1 })
        .mockRejectedValueOnce(new Error('API error'))

      const result = await service.findAll(mockTake, mockSkip, mockUserId)

      expect(result).toEqual([mockTrip1])
      expect(Logger.prototype.warn).toHaveBeenCalledWith(
        expect.stringContaining('trip-uuid-2'),
      )
    })

    it('should return empty response when all requests fail', async () => {
      mockSavedTripRepository.find.mockResolvedValue(mockSavedTrips)
      mockTripsApiService.findOne
        .mockRejectedValueOnce(new Error('API error 1'))
        .mockRejectedValueOnce(new Error('API error 2'))

      const result = await service.findAll(mockTake, mockSkip, mockUserId)

      expect(result).toEqual([])
      expect(Logger.prototype.warn).toHaveBeenCalled()
    })

    it('should apply pagination parameters correctly', async () => {
      const customTake = 5
      const customSkip = 10

      mockSavedTripRepository.find.mockResolvedValue([])

      await service.findAll(customTake, customSkip, mockUserId)

      expect(savedTripRepository.find).toHaveBeenCalledWith({
        where: { userId: mockUserId },
        take: customTake,
        skip: customSkip,
      })
    })
  })

  describe('save', () => {
    const mockTripId = 'trip-uuid-123'
    const mockUserId = 1

    it('should save a new trip successfully and return true', async () => {
      mockSavedTripRepository.findOne.mockResolvedValue(null)
      mockSavedTripRepository.save.mockResolvedValue({
        id: 1,
        tripId: mockTripId,
        userId: mockUserId,
      } as SavedTrip)

      const result = await service.save(mockTripId, mockUserId)

      expect(savedTripRepository.findOne).toHaveBeenCalledWith({
        where: { tripId: mockTripId, userId: mockUserId },
        select: ['id'],
      })
      expect(savedTripRepository.save).toHaveBeenCalledWith({
        tripId: mockTripId,
        userId: mockUserId,
      })
      expect(result).toBe(true)
    })

    it('should return false when trip is already saved', async () => {
      const existingSavedTrip = {
        id: 1,
        tripId: mockTripId,
        userId: mockUserId,
      } as SavedTrip

      mockSavedTripRepository.findOne.mockResolvedValue(existingSavedTrip)

      const result = await service.save(mockTripId, mockUserId)

      expect(savedTripRepository.findOne).toHaveBeenCalledWith({
        where: { tripId: mockTripId, userId: mockUserId },
        select: ['id'],
      })
      expect(savedTripRepository.save).not.toHaveBeenCalled()
      expect(result).toBe(false)
    })

    it('should throw NotFoundException when trip does not exist in external API', async () => {
      mockSavedTripRepository.findOne.mockResolvedValue(null)
      mockTripsApiService.findOne.mockRejectedValue(new Error('Trip not found'))

      await expect(service.save(mockTripId, mockUserId)).rejects.toThrow(
        NotFoundException,
      )
    })
  })

  describe('delete', () => {
    const mockTripId = 'trip-uuid-123'
    const mockUserId = 1

    it('should delete an existing saved trip and return true', async () => {
      const existingSavedTrip = {
        id: 1,
        tripId: mockTripId,
        userId: mockUserId,
      } as SavedTrip

      mockSavedTripRepository.findOne.mockResolvedValue(existingSavedTrip)
      mockSavedTripRepository.delete.mockResolvedValue({ affected: 1, raw: {} })

      const result = await service.delete(mockTripId, mockUserId)

      expect(savedTripRepository.findOne).toHaveBeenCalledWith({
        where: { tripId: mockTripId, userId: mockUserId },
        select: ['id'],
      })
      expect(savedTripRepository.delete).toHaveBeenCalledWith({
        tripId: mockTripId,
        userId: mockUserId,
      })
      expect(result).toBe(true)
    })

    it('should return false when trip does not exist', async () => {
      mockSavedTripRepository.findOne.mockResolvedValue(null)

      const result = await service.delete(mockTripId, mockUserId)

      expect(savedTripRepository.findOne).toHaveBeenCalledWith({
        where: { tripId: mockTripId, userId: mockUserId },
        select: ['id'],
      })
      expect(savedTripRepository.delete).not.toHaveBeenCalled()
      expect(result).toBe(false)
    })
  })
})
