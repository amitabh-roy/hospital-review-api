import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

import type { AuthenticatedUser } from '../../modules/users/interfaces/authenticated-user.interface';
import { USER_RESPONSE } from '../../modules/users/constants/user.response';

@Injectable()
export class VerifiedUserGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context
      .switchToHttp()
      .getRequest<{ user?: AuthenticatedUser }>();
    const user = request.user;

    if (
      !user ||
      (user.verificationStatus !== 'verified' && !user.isVerified)
    ) {
      throw new ForbiddenException(USER_RESPONSE.EMAIL_NOT_VERIFIED);
    }

    return true;
  }
}
