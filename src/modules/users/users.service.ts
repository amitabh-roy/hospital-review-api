import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/sequelize';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { ControllerResponse } from '../../common/interfaces/controller-response.interface';
import { handleDatabaseException } from '../../common/utils/database-exception.util';
import { RoleModel } from '../../database/models/role.model';
import { UserModel } from '../../database/models/user.model';
import { USER_RESPONSE } from './constants/user.response';
import { AuthTokenResponseDto } from './dto/auth-token-response.dto';
import { AuthUserResponseDto } from './dto/auth-user-response.dto';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';
import { AuthenticatedUser } from './interfaces/authenticated-user.interface';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(UserModel)
    private readonly userModel: typeof UserModel,
    @InjectModel(RoleModel)
    private readonly roleModel: typeof RoleModel,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async signup(
    dto: SignupDto,
  ): Promise<ControllerResponse<AuthTokenResponseDto>> {
    try {
      const email = dto.email.trim().toLowerCase();
      const role = await this.roleModel.findByPk(dto.roleId);

      if (!role) {
        throw new NotFoundException(USER_RESPONSE.ROLE_NOT_FOUND);
      }

      const existingUser = await this.userModel.findOne({ where: { email } });

      if (existingUser) {
        throw new ConflictException(USER_RESPONSE.EMAIL_IN_USE);
      }

      const saltRounds = this.configService.get<number>('app.saltRounds', 10);
      const passwordHash = await bcrypt.hash(dto.password, saltRounds);

      const createdUser = await this.userModel.create({
        fullName: dto.fullName.trim(),
        email,
        passwordHash,
        roleId: role.id,
        isVerified: false,
        verificationStatus: 'pending',
      });

      const persistedUser = await this.userModel.findByPk(createdUser.id, {
        include: [RoleModel],
      });

      if (!persistedUser || !persistedUser.role) {
        throw new NotFoundException(USER_RESPONSE.USER_NOT_FOUND);
      }

      return {
        message: USER_RESPONSE.SIGNUP_SUCCESS,
        data: await this.buildAuthResponse(persistedUser),
      };
    } catch (error) {
      handleDatabaseException(error, {
        context: UsersService.name,
        operation: 'user signup',
        uniqueConstraintMessage: USER_RESPONSE.EMAIL_IN_USE,
      });
    }
  }

  async login(
    dto: LoginDto,
  ): Promise<ControllerResponse<AuthTokenResponseDto>> {
    try {
      const email = dto.email.trim().toLowerCase();
      const user = await this.userModel.unscoped().findOne({
        where: { email },
        include: [RoleModel],
      });

      if (!user || !user.role) {
        throw new UnauthorizedException(USER_RESPONSE.INVALID_CREDENTIALS);
      }

      const isPasswordValid = await bcrypt.compare(
        dto.password,
        user.passwordHash,
      );

      if (!isPasswordValid) {
        throw new UnauthorizedException(USER_RESPONSE.INVALID_CREDENTIALS);
      }

      return {
        message: USER_RESPONSE.LOGIN_SUCCESS,
        data: await this.buildAuthResponse(user),
      };
    } catch (error) {
      handleDatabaseException(error, {
        context: UsersService.name,
        operation: 'user login',
      });
    }
  }

  getMe(user: AuthenticatedUser): ControllerResponse<AuthUserResponseDto> {
    return {
      message: USER_RESPONSE.PROFILE_FETCHED,
      data: user,
    };
  }

  private async buildAuthResponse(
    user: UserModel,
  ): Promise<AuthTokenResponseDto> {
    const authenticatedUser = this.toAuthenticatedUser(user);
    const payload: JwtPayload = {
      sub: authenticatedUser.id,
      email: authenticatedUser.email,
      roleId: authenticatedUser.roleId,
      roleName: authenticatedUser.roleName,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    return {
      accessToken,
      tokenType: 'Bearer',
      expiresIn: this.configService.get<string>('auth.jwtExpiresIn', '1d'),
      user: authenticatedUser,
    };
  }

  toAuthenticatedUser(user: UserModel): AuthenticatedUser {
    if (!user.role) {
      throw new NotFoundException(USER_RESPONSE.ROLE_NOT_FOUND);
    }

    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      roleId: user.roleId,
      roleName: user.role.name,
      isVerified: user.isVerified,
      verificationStatus: user.verificationStatus,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
