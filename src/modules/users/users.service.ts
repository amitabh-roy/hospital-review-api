import {
  BadRequestException,
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
import { UserModel } from '../../database/models/user.model';
import { RoleModel } from '../../database/models/role.model';
import { AuthTokensService } from './auth-tokens.service';
import { USER_RESPONSE } from './constants/user.response';
import { AdminUpdateVerificationDto } from './dto/admin-update-verification.dto';
import { AuthTokenResponseDto } from './dto/auth-token-response.dto';
import { AuthUserResponseDto } from './dto/auth-user-response.dto';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';
import { EmailService } from './email.service';
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
    private readonly authTokensService: AuthTokensService,
    private readonly emailService: EmailService,
  ) {}

  async signup(
    dto: SignupDto,
  ): Promise<ControllerResponse<AuthTokenResponseDto>> {
    try {
      const email = dto.email.trim().toLowerCase();
      const role = await this.roleModel.findOne({
        where: { name: dto.occupation.trim() },
      });

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

      await this.sendVerificationEmail(persistedUser);

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
      console.error('[users.service.login] Error:', error);
      handleDatabaseException(error, {
        context: UsersService.name,
        operation: 'user login',
      });
    }
  }

  async refresh(
    refreshToken: string,
  ): Promise<ControllerResponse<AuthTokenResponseDto>> {
    try {
      const userId =
        await this.authTokensService.validateRefreshToken(refreshToken);
      await this.authTokensService.revokeRefreshToken(refreshToken);

      const user = await this.userModel.findByPk(userId, {
        include: [RoleModel],
      });

      if (!user || !user.role) {
        throw new UnauthorizedException(USER_RESPONSE.USER_NOT_FOUND);
      }

      return {
        message: USER_RESPONSE.REFRESH_SUCCESS,
        data: await this.buildAuthResponse(user),
      };
    } catch (error) {
      handleDatabaseException(error, {
        context: UsersService.name,
        operation: 'token refresh',
      });
    }
  }

  async logout(refreshToken: string): Promise<ControllerResponse<null>> {
    try {
      await this.authTokensService.revokeRefreshToken(refreshToken);

      return {
        message: USER_RESPONSE.LOGOUT_SUCCESS,
        data: null,
      };
    } catch (error) {
      handleDatabaseException(error, {
        context: UsersService.name,
        operation: 'logout',
      });
    }
  }

  async verifyEmail(
    token: string,
  ): Promise<ControllerResponse<AuthUserResponseDto>> {
    try {
      const user = await this.authTokensService.consumeAuthToken(
        token,
        'email_verification',
      );

      await user.update({
        isVerified: true,
        verificationStatus: 'verified',
      });

      const updated = await this.userModel.findByPk(user.id, {
        include: [RoleModel],
      });

      if (!updated || !updated.role) {
        throw new NotFoundException(USER_RESPONSE.USER_NOT_FOUND);
      }

      return {
        message: USER_RESPONSE.EMAIL_VERIFIED,
        data: this.toAuthenticatedUser(updated),
      };
    } catch (error) {
      handleDatabaseException(error, {
        context: UsersService.name,
        operation: 'email verification',
      });
    }
  }

  async resendVerification(
    user: AuthenticatedUser,
  ): Promise<ControllerResponse<null>> {
    try {
      if (user.verificationStatus === 'verified' || user.isVerified) {
        throw new BadRequestException(USER_RESPONSE.ALREADY_VERIFIED);
      }

      const persistedUser = await this.userModel.findByPk(user.id);

      if (!persistedUser) {
        throw new NotFoundException(USER_RESPONSE.USER_NOT_FOUND);
      }

      await this.sendVerificationEmail(persistedUser);

      return {
        message: USER_RESPONSE.VERIFICATION_EMAIL_SENT,
        data: null,
      };
    } catch (error) {
      handleDatabaseException(error, {
        context: UsersService.name,
        operation: 'resend verification email',
      });
    }
  }

  async forgotPassword(email: string): Promise<ControllerResponse<null>> {
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const user = await this.userModel.findOne({
        where: { email: normalizedEmail },
      });

      if (user) {
        const { token } = await this.authTokensService.issueAuthToken(
          user.id,
          'password_reset',
        );
        await this.emailService.sendPasswordResetEmail(user.email, token);
      }

      return {
        message: USER_RESPONSE.PASSWORD_RESET_EMAIL_SENT,
        data: null,
      };
    } catch (error) {
      handleDatabaseException(error, {
        context: UsersService.name,
        operation: 'forgot password',
      });
    }
  }

  async resetPassword(
    token: string,
    password: string,
  ): Promise<ControllerResponse<null>> {
    try {
      const user = await this.authTokensService.consumeAuthToken(
        token,
        'password_reset',
      );
      const saltRounds = this.configService.get<number>('app.saltRounds', 10);
      const passwordHash = await bcrypt.hash(password, saltRounds);

      await user.update({ passwordHash });
      await this.authTokensService.revokeAllRefreshTokensForUser(user.id);

      return {
        message: USER_RESPONSE.PASSWORD_RESET_SUCCESS,
        data: null,
      };
    } catch (error) {
      handleDatabaseException(error, {
        context: UsersService.name,
        operation: 'reset password',
      });
    }
  }

  async adminUpdateVerification(
    userId: number,
    dto: AdminUpdateVerificationDto,
  ): Promise<ControllerResponse<AuthUserResponseDto>> {
    try {
      const user = await this.userModel.findByPk(userId, {
        include: [RoleModel],
      });

      if (!user || !user.role) {
        throw new NotFoundException(USER_RESPONSE.USER_NOT_FOUND);
      }

      const verificationStatus = dto.verificationStatus;
      await user.update({
        verificationStatus,
        isVerified: verificationStatus === 'verified',
      });
      await user.reload({ include: [RoleModel] });

      return {
        message: USER_RESPONSE.VERIFICATION_UPDATED,
        data: this.toAuthenticatedUser(user),
      };
    } catch (error) {
      handleDatabaseException(error, {
        context: UsersService.name,
        operation: 'admin verification update',
      });
    }
  }

  getMe(user: AuthenticatedUser): ControllerResponse<AuthUserResponseDto> {
    return {
      message: USER_RESPONSE.PROFILE_FETCHED,
      data: user,
    };
  }

  private async sendVerificationEmail(user: UserModel): Promise<void> {
    const { token } = await this.authTokensService.issueAuthToken(
      user.id,
      'email_verification',
    );
    await this.emailService.sendVerificationEmail(user.email, token);
  }

  private async buildAuthResponse(
    user: UserModel,
  ): Promise<AuthTokenResponseDto> {
    const authenticatedUser = this.toAuthenticatedUser(user);
    const jwtSecret = this.requireJwtSecret();
    const payload: JwtPayload = {
      sub: authenticatedUser.id,
      email: authenticatedUser.email,
      roleId: authenticatedUser.roleId,
      roleName: authenticatedUser.roleName,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: jwtSecret,
    });
    let refreshToken: string | undefined;
    let refreshExpiresIn: string | undefined;

    try {
      const refresh = await this.authTokensService.issueRefreshToken(user.id);
      refreshToken = refresh.token;
      refreshExpiresIn = this.configService.get<string>(
        'auth.refreshExpiresIn',
        '7d',
      );
    } catch {
      // Refresh tokens are optional for MVP flows; if the backing table isn't migrated yet,
      // we still allow login/signup to succeed with an access token.
      refreshToken = undefined;
      refreshExpiresIn = undefined;
    }

    return {
      accessToken,
      tokenType: 'Bearer',
      expiresIn: this.configService.get<string>('auth.jwtExpiresIn', '1d'),
      refreshToken,
      refreshExpiresIn,
      user: authenticatedUser,
    };
  }

  private requireJwtSecret(): string {
    const secret = this.configService.get<string>('auth.jwtSecret');

    if (!secret) {
      throw new Error('JWT_SECRET is not configured');
    }

    return secret;
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
