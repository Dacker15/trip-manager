import { ApiPropertyOptional } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import { IsNumber, Min } from 'class-validator'

export class PaginationDto {
  @ApiPropertyOptional({
    type: Number,
    description: 'Number of items to return',
    default: 20,
  })
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @Min(0)
  take: number = 20

  @ApiPropertyOptional({
    type: Number,
    description: 'Number of items to skip from beginning',
    default: 0,
  })
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @Min(0)
  skip: number = 0
}
