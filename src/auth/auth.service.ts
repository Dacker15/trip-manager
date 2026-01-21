import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
  HttpException,
  InternalServerErrorException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { InjectRepository } from '@nestjs/typeorm'
import * as bcrypt from 'bcrypt'
import { Repository } from 'typeorm'
import { User } from '@users/entities/user.entity'
import { AuthResponseDto } from './dtos/auth-response.dto'
import { JwtPayload } from './interfaces/jwt-payload.interface'

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async signUp(userName: string, password: string) {
    try {
      const existingUser = await this.userRepository.findOne({
        where: { userName },
      })

      if (existingUser) {
        throw new ConflictException('Username already exists')
      }

      const saltRounds = 10
      const hashedPassword = await bcrypt.hash(password, saltRounds)

      const user = this.userRepository.create({
        userName,
        password: hashedPassword,
      })
      await this.userRepository.save(user)

      return this.generateTokens(user)
    } catch (error) {
      if (error instanceof HttpException) {
        throw error
      }
      throw new InternalServerErrorException(String(error))
    }
  }

  async login(userName: string, password: string): Promise<AuthResponseDto> {
    try {
      const user = await this.userRepository.findOne({
        where: { userName },
      })

      if (!user) {
        throw new NotFoundException('Invalid credentials')
      }

      const isPasswordValid = await bcrypt.compare(password, user.password)
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials')
      }

      return this.generateTokens(user)
    } catch (error) {
      if (error instanceof HttpException) {
        throw error
      }
      throw new InternalServerErrorException(String(error))
    }
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify<JwtPayload>(refreshToken, {
        secret: this.configService.get<string>('JWT_SECRET'),
      })

      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('Invalid token type')
      }

      const user = await this.userRepository.findOne({
        where: { id: payload.sub },
      })

      if (!user) {
        throw new NotFoundException('User not found')
      }

      return this.generateTokens(user)
    } catch (error) {
      if (error instanceof HttpException) {
        throw error
      }
      throw new InternalServerErrorException(String(error))
    }
  }

  private generateTokens(user: User): AuthResponseDto {
    const accessPayload: JwtPayload = {
      sub: user.id,
      type: 'access',
    }

    const refreshPayload: JwtPayload = {
      sub: user.id,
      type: 'refresh',
    }

    const accessToken = this.jwtService.sign(accessPayload, {
      secret: this.configService.getOrThrow('JWT_SECRET'),
      expiresIn: this.configService.getOrThrow('JWT_EXPIRES_IN'),
    })

    const refreshToken = this.jwtService.sign(refreshPayload, {
      secret: this.configService.getOrThrow('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.getOrThrow('JWT_REFRESH_EXPIRES_IN'),
    })

    return {
      accessToken,
      refreshToken,
    }
  }
}
