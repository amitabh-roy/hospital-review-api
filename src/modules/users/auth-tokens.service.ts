import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';

import {
  generateOpaqueToken,
  hashOpaqueToken,
} from '../../common/utils/token-hash.util';
import {
  AuthTokenModel,
  AuthTokenType,
} from '../../database/models/auth-token.model';
import { RefreshTokenModel } from '../../database/models/refresh-token.model';
import { UserModel } from '../../database/models/user.model';
import { USER_RESPONSE } from './constants/user.response';

export type IssuedRefreshToken = {
  token: string;
  expiresAt: Date;
};

@Injectable()
export class AuthTokensService {
  constructor(
    @InjectModel(RefreshTokenModel)
    private readonly refreshTokenModel: typeof RefreshTokenModel,
    @InjectModel(AuthTokenModel)
    private readonly authTokenModel: typeof AuthTokenModel,
    private readonly configService: ConfigService,
  ) {}

  async issueRefreshToken(userId: number): Promise<IssuedRefreshToken> {
    const token = generateOpaqueToken();
    const expiresAt = this.resolveExpiry(
      this.configService.get<string>('auth.refreshExpiresIn', '7d'),
    );

    await this.refreshTokenModel.create({
      userId,
      tokenHash: hashOpaqueToken(token),
      expiresAt,
      revokedAt: null,
    });

    return { token, expiresAt };
  }

  async validateRefreshToken(token: string): Promise<number> {
    const record = await this.refreshTokenModel.findOne({
      where: {
        tokenHash: hashOpaqueToken(token),
        revokedAt: null,
        expiresAt: { [Op.gt]: new Date() },
      },
    });

    if (!record) {
      throw new UnauthorizedException(USER_RESPONSE.INVALID_REFRESH_TOKEN);
    }

    return record.userId;
  }

  async revokeRefreshToken(token: string): Promise<void> {
    const record = await this.refreshTokenModel.findOne({
      where: { tokenHash: hashOpaqueToken(token), revokedAt: null },
    });

    if (!record) {
      return;
    }

    record.revokedAt = new Date();
    await record.save();
  }

  async revokeAllRefreshTokensForUser(userId: number): Promise<void> {
    await this.refreshTokenModel.update(
      { revokedAt: new Date() },
      { where: { userId, revokedAt: null } },
    );
  }

  async issueAuthToken(
    userId: number,
    type: AuthTokenType,
  ): Promise<{ token: string; expiresAt: Date }> {
    await this.authTokenModel.update(
      { consumedAt: new Date() },
      {
        where: {
          userId,
          type,
          consumedAt: null,
          expiresAt: { [Op.gt]: new Date() },
        },
      },
    );

    const token = generateOpaqueToken();
    const configKey =
      type === 'email_verification'
        ? 'auth.emailVerificationExpiresIn'
        : 'auth.passwordResetExpiresIn';
    const expiresAt = this.resolveExpiry(
      this.configService.get<string>(configKey, '24h'),
    );

    await this.authTokenModel.create({
      userId,
      type,
      tokenHash: hashOpaqueToken(token),
      expiresAt,
      consumedAt: null,
    });

    return { token, expiresAt };
  }

  async consumeAuthToken(
    token: string,
    type: AuthTokenType,
  ): Promise<UserModel> {
    const record = await this.authTokenModel.findOne({
      where: {
        tokenHash: hashOpaqueToken(token),
        type,
        consumedAt: null,
        expiresAt: { [Op.gt]: new Date() },
      },
      include: [UserModel],
    });

    if (!record?.user) {
      throw new UnauthorizedException(USER_RESPONSE.INVALID_OR_EXPIRED_TOKEN);
    }

    record.consumedAt = new Date();
    await record.save();

    return record.user;
  }

  private resolveExpiry(duration: string): Date {
    const match = /^(\d+)([smhd])$/.exec(duration.trim());

    if (!match) {
      return new Date(Date.now() + 24 * 60 * 60 * 1000);
    }

    const amount = Number.parseInt(match[1], 10);
    const unit = match[2];
    const multipliers: Record<string, number> = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
    };

    return new Date(Date.now() + amount * (multipliers[unit] ?? multipliers.d));
  }
}
