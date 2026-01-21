import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { InjectRepository } from '@nestjs/typeorm'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { Repository } from 'typeorm'
import { JwtPayload } from '@auth/interfaces/jwt-payload.interface'
import { User } from '@providers/database/entities/user.entity'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    })
  }

  async validate(payload: JwtPayload): Promise<User> {
    try {
      if (payload.type !== 'access') {
        throw new UnauthorizedException('Invalid token type')
      }

      const user = await this.userRepository.findOne({
        where: { id: payload.sub },
      })

      if (!user) {
        throw new UnauthorizedException('User not found')
      }

      return user
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error
      }
      throw new InternalServerErrorException(String(error))
    }
  }
}
