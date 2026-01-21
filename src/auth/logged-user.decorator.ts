import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { Request } from 'express'
import { User } from '@common/interfaces/user.interface'

export const LoggedUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): number => {
    const request: Request = ctx.switchToHttp().getRequest()
    const user = request.user as User
    return user.id
  },
)
