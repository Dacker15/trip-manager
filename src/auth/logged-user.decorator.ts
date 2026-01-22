import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { User } from '@common/interfaces/user.interface'

export const LoggedUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): number => {
    const request = ctx.switchToHttp().getRequest<{ user: User }>()
    const user = request.user
    return user.id
  },
)
