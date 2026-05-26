import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { SequelizeModule } from '@nestjs/sequelize';
import type { StringValue } from 'ms';

import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RoleModel } from '../../database/models/role.model';
import { UserModel } from '../../database/models/user.model';
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
        const secret =
          configService.get<string>('auth.jwtSecret') ??
          'change-me-in-production';
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
    SequelizeModule.forFeature([UserModel, RoleModel]),
  ],
  controllers: [UsersController],
  providers: [UsersService, JwtStrategy, JwtAuthGuard],
  exports: [UsersService, JwtModule],
})
export class UsersModule {}
