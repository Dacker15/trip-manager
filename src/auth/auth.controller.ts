import { Body, Controller, Post } from '@nestjs/common'
import {
  ApiTags,
  ApiConflictResponse,
  ApiUnauthorizedResponse,
  ApiNotFoundResponse,
  ApiInternalServerErrorResponse,
  ApiBadRequestResponse,
  ApiCreatedResponse,
} from '@nestjs/swagger'
import { AuthService } from './auth.service'
import { AuthResponseDto } from './dtos/auth-response.dto'
import { LoginDto } from './dtos/login.dto'
import { RefreshTokenDto } from './dtos/refresh-token.dto'
import { SignUpDto } from './dtos/sign-up.dto'

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @ApiCreatedResponse({
    description: 'User successfully registered',
    type: AuthResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data or validation failed',
  })
  @ApiConflictResponse({
    description: 'Username already exists',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error occurred during registration',
  })
  async signUp(@Body() signUpDto: SignUpDto) {
    return this.authService.signUp(signUpDto.userName, signUpDto.password)
  }

  @Post('login')
  @ApiCreatedResponse({
    description: 'User successfully authenticated',
    type: AuthResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data or validation failed',
  })
  @ApiNotFoundResponse({
    description: 'Invalid credentials - user not found',
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid credentials - incorrect password',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error occurred during login',
  })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto.userName, loginDto.password)
  }

  @Post('refresh')
  @ApiCreatedResponse({
    description: 'Tokens successfully refreshed',
    type: AuthResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data or validation failed',
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid or expired refresh token',
  })
  @ApiNotFoundResponse({
    description: 'User associated to the refresh token not found',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error occurred during token refresh',
  })
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto.refreshToken)
  }
}
