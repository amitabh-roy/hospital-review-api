import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { SequelizeModule } from '@nestjs/sequelize';
import type { StringValue } from 'ms';

import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { AuthSecurityBootstrap } from '../../config/auth-security.bootstrap';
import { AuthTokenModel } from '../../database/models/auth-token.model';
import { RefreshTokenModel } from '../../database/models/refresh-token.model';
import { RoleModel } from '../../database/models/role.model';
import { UserModel } from '../../database/models/user.model';
import { AuthTokensService } from './auth-tokens.service';
import { EmailService } from './email.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [
    ConfigModule,
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const secret = configService.get<string>('auth.jwtSecret');

        if (!secret) {
          throw new Error('JWT_SECRET is not configured');
        }

        const expiresIn = (configService.get<string>('auth.jwtExpiresIn') ??
          '1d') as StringValue;

        return {
          secret,
          signOptions: {
            expiresIn,
          },
        };
      },
    }),
    SequelizeModule.forFeature([
      UserModel,
      RoleModel,
      RefreshTokenModel,
      AuthTokenModel,
    ]),
  ],
  controllers: [UsersController],
  providers: [
    UsersService,
    AuthTokensService,
    EmailService,
    JwtStrategy,
    JwtAuthGuard,
    RolesGuard,
    AuthSecurityBootstrap,
  ],
  exports: [UsersService, EmailService, JwtModule, JwtAuthGuard, RolesGuard],
})
export class UsersModule {}
