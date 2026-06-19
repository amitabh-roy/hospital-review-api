import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { ApiTags } from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import {
  AdminUpdateVerificationSwagger,
  ForgotPasswordSwagger,
  LoginSwagger,
  LogoutSwagger,
  MeSwagger,
  RefreshTokenSwagger,
  ResendVerificationSwagger,
  ResetPasswordSwagger,
  SignupSwagger,
  VerifyEmailSwagger,
} from './docs/users.swagger';
import { AdminUpdateVerificationDto } from './dto/admin-update-verification.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { DeleteAccountDto } from './dto/delete-account.dto';
import { SignupDto } from './dto/signup.dto';
import { UpdateEmailDto } from './dto/update-email.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import type { ControllerResponse } from '../../common/interfaces/controller-response.interface';
import type { AccountDeletionRequestResponseDto } from './dto/account-deletion-request-response.dto';
import type { AuthenticatedUser } from './interfaces/authenticated-user.interface';
import { UsersService } from './users.service';

@ApiTags('Auth')
@Controller('auth')
@UseGuards(ThrottlerGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('signup')
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @SignupSwagger()
  signup(@Body() dto: SignupDto) {
    return this.usersService.signup(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @LoginSwagger()
  login(@Body() dto: LoginDto, @Req() req: Request) {
    return this.usersService.login(dto, {
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'] ?? null,
    });
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  @RefreshTokenSwagger()
  refresh(@Body() dto: RefreshTokenDto) {
    return this.usersService.refresh(dto.refreshToken);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  @LogoutSwagger()
  logout(@Body() dto: RefreshTokenDto) {
    return this.usersService.logout(dto.refreshToken);
  }

  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @VerifyEmailSwagger()
  verifyEmail(@Body() dto: VerifyEmailDto) {
    return this.usersService.verifyEmail(dto.token);
  }

  @Post('resend-verification')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @ResendVerificationSwagger()
  resendVerification(@CurrentUser() user: AuthenticatedUser) {
    return this.usersService.resendVerification(user);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @ForgotPasswordSwagger()
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.usersService.forgotPassword(dto.email);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @ResetPasswordSwagger()
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.usersService.resetPassword(dto.token, dto.password);
  }

  @Patch('admin/users/:id/verification')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @AdminUpdateVerificationSwagger()
  adminUpdateVerification(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AdminUpdateVerificationDto,
  ) {
    return this.usersService.adminUpdateVerification(id, dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @MeSwagger()
  me(@CurrentUser() user: AuthenticatedUser) {
    return this.usersService.getMe(user);
  }

  @Patch('me/email')
  @UseGuards(JwtAuthGuard)
  updateEmail(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateEmailDto,
  ) {
    return this.usersService.updateEmail(user, dto);
  }

  @Patch('me/password')
  @UseGuards(JwtAuthGuard)
  updatePassword(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdatePasswordDto,
  ) {
    return this.usersService.updatePassword(user, dto);
  }

  @Get('me/deletion-request')
  @UseGuards(JwtAuthGuard)
  getMyDeletionRequest(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ControllerResponse<AccountDeletionRequestResponseDto | null>> {
    return this.usersService.getMyDeletionRequest(user);
  }

  @Post('me/deletion-request')
  @UseGuards(JwtAuthGuard)
  requestAccountDeletion(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: DeleteAccountDto,
  ): Promise<ControllerResponse<AccountDeletionRequestResponseDto>> {
    return this.usersService.requestAccountDeletion(user, dto);
  }
}
