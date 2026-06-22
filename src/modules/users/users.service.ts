import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { ControllerResponse } from '../../common/interfaces/controller-response.interface';
import { handleDatabaseException } from '../../common/utils/database-exception.util';
import { LoginEventModel } from '../../database/models/login-event.model';
import { AccountDeletionRequestModel } from '../../database/models/account-deletion-request.model';
import { SavedHospitalModel } from '../../database/models/saved-hospital.model';
import { UserModel } from '../../database/models/user.model';
import { RoleModel } from '../../database/models/role.model';
import { AuthTokensService } from './auth-tokens.service';
import { USER_RESPONSE } from './constants/user.response';
import { AdminUpdateVerificationDto } from './dto/admin-update-verification.dto';
import { AuthTokenResponseDto } from './dto/auth-token-response.dto';
import { AuthUserResponseDto } from './dto/auth-user-response.dto';
import { DeleteAccountDto } from './dto/delete-account.dto';
import { AccountDeletionRequestResponseDto } from './dto/account-deletion-request-response.dto';
import { ReviewAccountDeletionDto } from './dto/review-account-deletion.dto';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';
import { UpdateEmailDto } from './dto/update-email.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { EmailService } from './email.service';
import { AuthenticatedUser } from './interfaces/authenticated-user.interface';
import { JwtPayload } from './interfaces/jwt-payload.interface';

const deletionRequestUserInclude = {
  model: UserModel,
  paranoid: false,
  include: [RoleModel],
};

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(UserModel)
    private readonly userModel: typeof UserModel,
    @InjectModel(RoleModel)
    private readonly roleModel: typeof RoleModel,
    @InjectModel(LoginEventModel)
    private readonly loginEventModel: typeof LoginEventModel,
    @InjectModel(SavedHospitalModel)
    private readonly savedHospitalModel: typeof SavedHospitalModel,
    @InjectModel(AccountDeletionRequestModel)
    private readonly accountDeletionRequestModel: typeof AccountDeletionRequestModel,
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

      const existingUser = await this.userModel.unscoped().findOne({
        where: { email },
      });

      if (existingUser) {
        if (existingUser.deletedAt) {
          throw new ConflictException(USER_RESPONSE.ACCOUNT_DEACTIVATED);
        }

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
      this.emailService.sendWelcomeEmail(
        persistedUser.email,
        persistedUser.fullName,
      );

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
    meta?: { ipAddress?: string; userAgent?: string | null },
  ): Promise<ControllerResponse<AuthTokenResponseDto>> {
    try {
      const email = dto.email.trim().toLowerCase();
      const user = await this.userModel.unscoped().findOne({
        where: { email },
        include: [RoleModel],
      });

      if (!user || !user.role) {
        await this.recordLoginEvent({
          email,
          userId: null,
          success: false,
          ipAddress: meta?.ipAddress ?? null,
          userAgent: meta?.userAgent ?? null,
        });
        throw new UnauthorizedException(USER_RESPONSE.INVALID_CREDENTIALS);
      }

      if (user.deletedAt) {
        await this.recordLoginEvent({
          email,
          userId: user.id,
          success: false,
          ipAddress: meta?.ipAddress ?? null,
          userAgent: meta?.userAgent ?? null,
        });
        throw new UnauthorizedException(USER_RESPONSE.ACCOUNT_DEACTIVATED);
      }

      const isPasswordValid = await bcrypt.compare(
        dto.password,
        user.passwordHash,
      );

      if (!isPasswordValid) {
        await this.recordLoginEvent({
          email,
          userId: user.id,
          success: false,
          ipAddress: meta?.ipAddress ?? null,
          userAgent: meta?.userAgent ?? null,
        });
        throw new UnauthorizedException(USER_RESPONSE.INVALID_CREDENTIALS);
      }

      await this.recordLoginEvent({
        email,
        userId: user.id,
        success: true,
        ipAddress: meta?.ipAddress ?? null,
        userAgent: meta?.userAgent ?? null,
      });

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

      const user = await this.userModel.unscoped().findByPk(userId, {
        include: [RoleModel],
      });

      if (!user || !user.role || user.deletedAt) {
        throw new UnauthorizedException(
          user?.deletedAt
            ? USER_RESPONSE.ACCOUNT_DEACTIVATED
            : USER_RESPONSE.USER_NOT_FOUND,
        );
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
        this.emailService.sendPasswordResetEmail(user.email, token);
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

  async updateEmail(
    user: AuthenticatedUser,
    dto: UpdateEmailDto,
  ): Promise<ControllerResponse<AuthUserResponseDto>> {
    try {
      const persisted = await this.userModel.unscoped().findByPk(user.id, {
        include: [RoleModel],
      });

      if (!persisted || !persisted.role) {
        throw new NotFoundException(USER_RESPONSE.USER_NOT_FOUND);
      }

      const validPassword = await bcrypt.compare(
        dto.password,
        persisted.passwordHash,
      );

      if (!validPassword) {
        throw new BadRequestException(USER_RESPONSE.WRONG_PASSWORD);
      }

      const email = dto.email.trim().toLowerCase();
      const existing = await this.userModel.findOne({ where: { email } });

      if (existing && existing.id !== user.id) {
        throw new ConflictException(USER_RESPONSE.EMAIL_IN_USE);
      }

      await persisted.update({ email, isVerified: false });
      await this.sendVerificationEmail(persisted);

      return {
        message: USER_RESPONSE.EMAIL_UPDATED,
        data: this.toAuthenticatedUser(persisted),
      };
    } catch (error) {
      handleDatabaseException(error, {
        context: UsersService.name,
        operation: 'update email',
        uniqueConstraintMessage: USER_RESPONSE.EMAIL_IN_USE,
      });
    }
  }

  async updatePassword(
    user: AuthenticatedUser,
    dto: UpdatePasswordDto,
  ): Promise<ControllerResponse<null>> {
    try {
      const persisted = await this.userModel.unscoped().findByPk(user.id);

      if (!persisted) {
        throw new NotFoundException(USER_RESPONSE.USER_NOT_FOUND);
      }

      const validPassword = await bcrypt.compare(
        dto.currentPassword,
        persisted.passwordHash,
      );

      if (!validPassword) {
        throw new BadRequestException(USER_RESPONSE.WRONG_PASSWORD);
      }

      if (dto.currentPassword === dto.newPassword) {
        throw new BadRequestException(
          USER_RESPONSE.NEW_PASSWORD_SAME_AS_CURRENT,
        );
      }

      const saltRounds = this.configService.get<number>('app.saltRounds', 10);
      const passwordHash = await bcrypt.hash(dto.newPassword, saltRounds);
      await persisted.update({ passwordHash });
      await this.authTokensService.revokeAllRefreshTokensForUser(user.id);

      return {
        message: USER_RESPONSE.PASSWORD_UPDATED,
        data: null,
      };
    } catch (error) {
      handleDatabaseException(error, {
        context: UsersService.name,
        operation: 'update password',
      });
    }
  }

  async requestAccountDeletion(
    user: AuthenticatedUser,
    dto: DeleteAccountDto,
  ): Promise<ControllerResponse<AccountDeletionRequestResponseDto>> {
    try {
      const persisted = await this.userModel.unscoped().findByPk(user.id);

      if (!persisted) {
        throw new NotFoundException(USER_RESPONSE.USER_NOT_FOUND);
      }

      if (persisted.deletedAt) {
        throw new BadRequestException(USER_RESPONSE.ACCOUNT_DEACTIVATED);
      }

      const validPassword = await bcrypt.compare(
        dto.password,
        persisted.passwordHash,
      );

      if (!validPassword) {
        throw new BadRequestException(USER_RESPONSE.WRONG_PASSWORD);
      }

      const existingPending = await this.accountDeletionRequestModel.findOne({
        where: { userId: user.id, status: 'pending' },
      });

      if (existingPending) {
        throw new BadRequestException(
          USER_RESPONSE.ACCOUNT_DELETION_ALREADY_PENDING,
        );
      }

      const request = await this.accountDeletionRequestModel.create({
        userId: user.id,
        reason: dto.reason.trim(),
        status: 'pending',
      });

      const loaded = await this.accountDeletionRequestModel.findByPk(
        request.id,
        {
          include: [deletionRequestUserInclude],
        },
      );

      if (!loaded) {
        throw new InternalServerErrorException(
          'Failed to load account deletion request',
        );
      }

      return {
        message: USER_RESPONSE.ACCOUNT_DELETION_REQUESTED,
        data: this.toDeletionRequestResponse(loaded),
      };
    } catch (error) {
      return handleDatabaseException(error, {
        context: UsersService.name,
        operation: 'request account deletion',
      });
    }
  }

  async getMyDeletionRequest(
    user: AuthenticatedUser,
  ): Promise<ControllerResponse<AccountDeletionRequestResponseDto | null>> {
    try {
      const request = await this.accountDeletionRequestModel.findOne({
        where: {
          userId: user.id,
          status: { [Op.in]: ['pending', 'rejected'] },
        },
        include: [deletionRequestUserInclude],
        order: [['createdAt', 'DESC']],
      });

      return {
        message: USER_RESPONSE.PROFILE_FETCHED,
        data: request ? this.toDeletionRequestResponse(request) : null,
      };
    } catch (error) {
      return handleDatabaseException(error, {
        context: UsersService.name,
        operation: 'fetch account deletion request',
      });
    }
  }

  async listPendingDeletionRequests(): Promise<
    ControllerResponse<{ items: AccountDeletionRequestResponseDto[] }>
  > {
    try {
      const items = await this.accountDeletionRequestModel.findAll({
        where: { status: 'pending' },
        include: [deletionRequestUserInclude],
        order: [['createdAt', 'ASC']],
      });

      return {
        message: USER_RESPONSE.ACCOUNT_DELETION_UPDATED,
        data: {
          items: items.map((item) => this.toDeletionRequestResponse(item)),
        },
      };
    } catch (error) {
      handleDatabaseException(error, {
        context: UsersService.name,
        operation: 'list pending account deletion requests',
      });
    }
  }

  async reviewDeletionRequest(
    requestId: number,
    dto: ReviewAccountDeletionDto,
  ): Promise<ControllerResponse<AccountDeletionRequestResponseDto>> {
    try {
      const request = await this.accountDeletionRequestModel.findByPk(
        requestId,
        {
          include: [deletionRequestUserInclude],
        },
      );

      if (!request || request.status !== 'pending') {
        throw new NotFoundException(USER_RESPONSE.ACCOUNT_DELETION_NOT_FOUND);
      }

      if (dto.status === 'approved') {
        await this.performAccountDeletion(request.userId);
      }

      await request.update({
        status: dto.status,
        adminNote: dto.adminNote?.trim() || null,
        reviewedAt: new Date(),
      });

      await request.reload({
        include: [deletionRequestUserInclude],
      });

      return {
        message: USER_RESPONSE.ACCOUNT_DELETION_UPDATED,
        data: this.toDeletionRequestResponse(request),
      };
    } catch (error) {
      handleDatabaseException(error, {
        context: UsersService.name,
        operation: 'review account deletion request',
      });
    }
  }

  async performAccountDeletion(userId: number): Promise<void> {
    const persisted = await this.userModel.unscoped().findByPk(userId);

    if (!persisted) {
      throw new NotFoundException(USER_RESPONSE.USER_NOT_FOUND);
    }

    if (persisted.deletedAt) {
      return;
    }

    await this.savedHospitalModel.destroy({ where: { userId } });
    await this.authTokensService.revokeAllRefreshTokensForUser(userId);
    await persisted.destroy();
  }

  private toDeletionRequestResponse(
    request: AccountDeletionRequestModel,
  ): AccountDeletionRequestResponseDto {
    return {
      id: request.id,
      userId: request.userId,
      userFullName: request.user?.fullName,
      userEmail: request.user?.email,
      reason: request.reason,
      status: request.status,
      adminNote: request.adminNote,
      reviewedAt: request.reviewedAt,
      createdAt: request.createdAt,
      updatedAt: request.updatedAt,
    };
  }

  private async recordLoginEvent(input: {
    email: string;
    userId: number | null;
    success: boolean;
    ipAddress: string | null;
    userAgent: string | null;
  }): Promise<void> {
    try {
      await this.loginEventModel.create({
        email: input.email,
        userId: input.userId,
        success: input.success,
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
      });
    } catch {
      // Login auditing should not block authentication.
    }
  }

  private async sendVerificationEmail(user: UserModel): Promise<void> {
    const { token } = await this.authTokensService.issueAuthToken(
      user.id,
      'email_verification',
    );
    this.emailService.sendVerificationEmail(user.email, token);
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
