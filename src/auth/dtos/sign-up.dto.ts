import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString, IsStrongPassword } from 'class-validator'

export class SignUpDto {
  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
  userName: string

  @ApiProperty({
    type: String,
    description:
      'Password must be at least 8 characters long and include uppercase, lowercase, number, and symbol.',
    minLength: 8,
  })
  @IsString()
  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  })
  password: string
}
