import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { InjectModel } from '@nestjs/sequelize';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { handleDatabaseException } from '../../../common/utils/database-exception.util';
import { RoleModel } from '../../../database/models/role.model';
import { UserModel } from '../../../database/models/user.model';
import { USER_RESPONSE } from '../constants/user.response';
import { AuthenticatedUser } from '../interfaces/authenticated-user.interface';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { UsersService } from '../users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    @InjectModel(UserModel)
    private readonly userModel: typeof UserModel,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:
        configService.get<string>('auth.jwtSecret') ??
        'change-me-in-production',
    });
  }

  async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
    try {
      const user = await this.userModel.findByPk(payload.sub, {
        include: [RoleModel],
      });

      if (!user || !user.role) {
        throw new UnauthorizedException(USER_RESPONSE.USER_NOT_FOUND);
      }

      return this.usersService.toAuthenticatedUser(user);
    } catch (error) {
      handleDatabaseException(error, {
        context: JwtStrategy.name,
        operation: 'JWT user validation',
      });
    }
  }
}
