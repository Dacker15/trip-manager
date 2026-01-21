import {
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import bcrypt from 'bcrypt'
import { Repository } from 'typeorm'
import { User } from '@providers/database/entities/user.entity'
import { AuthService } from './auth.service'
import { AuthResponseDto } from './dtos/auth-response.dto'

/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-misused-promises */
describe('AuthService', () => {
  let service: AuthService
  let userRepository: jest.Mocked<Repository<User>>
  let jwtService: jest.Mocked<JwtService>
  let configService: jest.Mocked<ConfigService>

  const mockUser: User = {
    id: 1,
    userName: 'testuser',
    password: 'hashedPassword123',
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const mockAuthResponse: AuthResponseDto = {
    accessToken: 'mock.access.token',
    refreshToken: 'mock.refresh.token',
  }

  const mockConfig = {
    JWT_SECRET: 'test-secret',
    JWT_EXPIRES_IN: '15m',
    JWT_REFRESH_SECRET: 'test-refresh-secret',
    JWT_REFRESH_EXPIRES_IN: '7d',
  }

  beforeEach(async () => {
    const mockUserRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    }

    const mockJwtService = {
      sign: jest.fn(),
      verify: jest.fn(),
    }

    const mockConfigService = {
      get: jest.fn(),
      getOrThrow: jest.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile()

    service = module.get<AuthService>(AuthService)
    userRepository = module.get(getRepositoryToken(User))
    jwtService = module.get(JwtService)
    configService = module.get(ConfigService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('signUp', () => {
    const userName = 'newuser'
    const password = 'password123'

    it('should successfully create a new user and return tokens', async () => {
      userRepository.findOne.mockResolvedValue(null)
      userRepository.create.mockReturnValue(mockUser)
      userRepository.save.mockResolvedValue(mockUser)
      configService.getOrThrow.mockImplementation(
        (key: string) => mockConfig[key],
      )
      jwtService.sign.mockReturnValueOnce(mockAuthResponse.accessToken)
      jwtService.sign.mockReturnValueOnce(mockAuthResponse.refreshToken)

      const result = await service.signUp(userName, password)

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { userName },
      })
      expect(userRepository.create).toHaveBeenCalledWith({
        userName,
        password: expect.any(String),
      })
      expect(userRepository.save).toHaveBeenCalledWith(mockUser)
      expect(result).toEqual(mockAuthResponse)
      expect(result.accessToken).toBeDefined()
      expect(result.refreshToken).toBeDefined()
    })

    it('should throw ConflictException if username already exists', async () => {
      userRepository.findOne.mockResolvedValue(mockUser)

      await expect(service.signUp(userName, password)).rejects.toThrow(
        ConflictException,
      )
      expect(userRepository.create).not.toHaveBeenCalled()
      expect(userRepository.save).not.toHaveBeenCalled()
    })

    it('should hash the password before saving', async () => {
      userRepository.findOne.mockResolvedValue(null)
      userRepository.create.mockReturnValue(mockUser)
      userRepository.save.mockResolvedValue(mockUser)
      configService.getOrThrow.mockImplementation(
        (key: string) => mockConfig[key],
      )
      jwtService.sign.mockReturnValueOnce(mockAuthResponse.accessToken)
      jwtService.sign.mockReturnValueOnce(mockAuthResponse.refreshToken)

      const bcryptHashSpy = jest.spyOn(bcrypt, 'hash')

      await service.signUp(userName, password)

      expect(bcryptHashSpy).toHaveBeenCalledWith(password, 10)
    })

    it('should throw InternalServerErrorException on unexpected errors', async () => {
      userRepository.findOne.mockRejectedValue(new Error('Database error'))

      await expect(service.signUp(userName, password)).rejects.toThrow(
        InternalServerErrorException,
      )
    })
  })

  describe('login', () => {
    const userName = 'testuser'
    const password = 'password123'

    it('should successfully login and return tokens', async () => {
      userRepository.findOne.mockResolvedValue(mockUser)
      jest
        .spyOn(bcrypt, 'compare')
        .mockImplementation(() => Promise.resolve(true))
      configService.getOrThrow.mockImplementation(
        (key: string) => mockConfig[key],
      )
      jwtService.sign.mockReturnValueOnce(mockAuthResponse.accessToken)
      jwtService.sign.mockReturnValueOnce(mockAuthResponse.refreshToken)

      const result = await service.login(userName, password)

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { userName },
      })
      expect(result).toEqual(mockAuthResponse)
      expect(result.accessToken).toBeDefined()
      expect(result.refreshToken).toBeDefined()
    })

    it('should throw NotFoundException if user does not exist', async () => {
      userRepository.findOne.mockResolvedValue(null)

      await expect(service.login(userName, password)).rejects.toThrow(
        NotFoundException,
      )
    })

    it('should throw UnauthorizedException if password is invalid', async () => {
      userRepository.findOne.mockResolvedValue(mockUser)
      jest
        .spyOn(bcrypt, 'compare')
        .mockImplementation(() => Promise.resolve(false))

      await expect(service.login(userName, password)).rejects.toThrow(
        UnauthorizedException,
      )
    })

    it('should compare password with hashed password', async () => {
      userRepository.findOne.mockResolvedValue(mockUser)
      const bcryptCompareSpy = jest
        .spyOn(bcrypt, 'compare')
        .mockImplementation(() => Promise.resolve(true))
      configService.getOrThrow.mockImplementation(
        (key: string) => mockConfig[key],
      )
      jwtService.sign.mockReturnValueOnce(mockAuthResponse.accessToken)
      jwtService.sign.mockReturnValueOnce(mockAuthResponse.refreshToken)

      await service.login(userName, password)

      expect(bcryptCompareSpy).toHaveBeenCalledWith(password, mockUser.password)
    })

    it('should throw InternalServerErrorException on unexpected errors', async () => {
      userRepository.findOne.mockRejectedValue(new Error('Database error'))

      await expect(service.login(userName, password)).rejects.toThrow(
        InternalServerErrorException,
      )
    })
  })

  describe('refreshToken', () => {
    const refreshToken = 'valid.refresh.token'
    const mockPayload = {
      sub: 1,
      type: 'refresh' as const,
    }

    it('should successfully refresh tokens with valid refresh token', async () => {
      jwtService.verify.mockReturnValue(mockPayload)
      userRepository.findOne.mockResolvedValue(mockUser)
      configService.get.mockReturnValue('test-secret')
      configService.getOrThrow.mockImplementation(
        (key: string) => mockConfig[key],
      )
      jwtService.sign.mockReturnValueOnce(mockAuthResponse.accessToken)
      jwtService.sign.mockReturnValueOnce(mockAuthResponse.refreshToken)

      const result = await service.refreshToken(refreshToken)

      expect(jwtService.verify).toHaveBeenCalledWith(refreshToken, {
        secret: 'test-secret',
      })
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockPayload.sub },
      })
      expect(result).toEqual(mockAuthResponse)
    })

    it('should throw UnauthorizedException if token type is not refresh', async () => {
      const invalidPayload = {
        sub: 1,
        type: 'access' as const,
      }
      jwtService.verify.mockReturnValue(invalidPayload)
      configService.get.mockReturnValue('test-secret')

      await expect(service.refreshToken(refreshToken)).rejects.toThrow(
        UnauthorizedException,
      )
    })

    it('should throw NotFoundException if user is not found', async () => {
      jwtService.verify.mockReturnValue(mockPayload)
      userRepository.findOne.mockResolvedValue(null)
      configService.get.mockReturnValue('test-secret')

      await expect(service.refreshToken(refreshToken)).rejects.toThrow(
        NotFoundException,
      )
    })

    it('should throw InternalServerErrorException on unexpected errors', async () => {
      jwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token')
      })
      configService.get.mockReturnValue('test-secret')

      await expect(service.refreshToken(refreshToken)).rejects.toThrow(
        InternalServerErrorException,
      )
    })

    it('should verify token with correct secret', async () => {
      const secret = 'test-jwt-secret'
      jwtService.verify.mockReturnValue(mockPayload)
      userRepository.findOne.mockResolvedValue(mockUser)
      configService.get.mockReturnValue(secret)
      configService.getOrThrow.mockImplementation(
        (key: string) => mockConfig[key],
      )
      jwtService.sign.mockReturnValueOnce(mockAuthResponse.accessToken)
      jwtService.sign.mockReturnValueOnce(mockAuthResponse.refreshToken)

      await service.refreshToken(refreshToken)

      expect(jwtService.verify).toHaveBeenCalledWith(refreshToken, {
        secret,
      })
    })
  })

  describe('generateTokens (indirect testing)', () => {
    it('should generate both access and refresh tokens in signUp', async () => {
      userRepository.findOne.mockResolvedValue(null)
      userRepository.create.mockReturnValue(mockUser)
      userRepository.save.mockResolvedValue(mockUser)
      configService.getOrThrow.mockImplementation(
        (key: string) => mockConfig[key],
      )
      jwtService.sign.mockReturnValueOnce(mockAuthResponse.accessToken)
      jwtService.sign.mockReturnValueOnce(mockAuthResponse.refreshToken)

      await service.signUp('testuser', 'password123')

      expect(jwtService.sign).toHaveBeenCalledTimes(2)
      expect(jwtService.sign).toHaveBeenNthCalledWith(
        1,
        { sub: mockUser.id, type: 'access' },
        { secret: 'test-secret', expiresIn: '15m' },
      )
      expect(jwtService.sign).toHaveBeenNthCalledWith(
        2,
        { sub: mockUser.id, type: 'refresh' },
        { secret: 'test-refresh-secret', expiresIn: '7d' },
      )
    })

    it('should use correct payload structure for access token', async () => {
      userRepository.findOne.mockResolvedValue(mockUser)
      jest
        .spyOn(bcrypt, 'compare')
        .mockImplementation(() => Promise.resolve(true))
      configService.getOrThrow.mockImplementation(
        (key: string) => mockConfig[key],
      )
      jwtService.sign.mockReturnValueOnce(mockAuthResponse.accessToken)
      jwtService.sign.mockReturnValueOnce(mockAuthResponse.refreshToken)

      await service.login('testuser', 'password123')

      expect(jwtService.sign).toHaveBeenCalledWith(
        expect.objectContaining({
          sub: mockUser.id,
          type: 'access',
        }),
        expect.any(Object),
      )
    })

    it('should use correct payload structure for refresh token', async () => {
      userRepository.findOne.mockResolvedValue(mockUser)
      jest
        .spyOn(bcrypt, 'compare')
        .mockImplementation(() => Promise.resolve(true))
      configService.getOrThrow.mockImplementation(
        (key: string) => mockConfig[key],
      )
      jwtService.sign.mockReturnValueOnce(mockAuthResponse.accessToken)
      jwtService.sign.mockReturnValueOnce(mockAuthResponse.refreshToken)

      await service.login('testuser', 'password123')

      expect(jwtService.sign).toHaveBeenCalledWith(
        expect.objectContaining({
          sub: mockUser.id,
          type: 'refresh',
        }),
        expect.any(Object),
      )
    })

    it('should use correct expiration times from config', async () => {
      userRepository.findOne.mockResolvedValue(mockUser)
      jest
        .spyOn(bcrypt, 'compare')
        .mockImplementation(() => Promise.resolve(true))
      configService.getOrThrow.mockImplementation(
        (key: string) => mockConfig[key],
      )
      jwtService.sign.mockReturnValueOnce(mockAuthResponse.accessToken)
      jwtService.sign.mockReturnValueOnce(mockAuthResponse.refreshToken)

      await service.login('testuser', 'password123')

      expect(jwtService.sign).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({ expiresIn: '15m' }),
      )
      expect(jwtService.sign).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({ expiresIn: '7d' }),
      )
    })
  })
})
