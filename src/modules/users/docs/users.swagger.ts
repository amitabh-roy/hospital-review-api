import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import {
  ApiStandardErrorResponses,
  ApiWrappedCreatedResponse,
  ApiWrappedOkResponse,
} from '../../../common/docs/swagger.common';
import { AdminUpdateVerificationDto } from '../dto/admin-update-verification.dto';
import { AuthTokenResponseDto } from '../dto/auth-token-response.dto';
import { AuthUserResponseDto } from '../dto/auth-user-response.dto';
import { ForgotPasswordDto } from '../dto/forgot-password.dto';
import { LoginDto } from '../dto/login.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { SignupDto } from '../dto/signup.dto';
import { VerifyEmailDto } from '../dto/verify-email.dto';

export const SignupSwagger = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Create a user account',
      description:
        'Registers a new user, hashes the password with bcrypt, and returns a JWT access token.',
    }),
    ApiBody({
      type: SignupDto,
      examples: {
        default: {
          summary: 'Nurse signup',
          value: {
            fullName: 'Taylor Brooks',
            email: 'taylor.brooks@example.com',
            password: 'Password@123',
            occupation: 'Registered Nurse (RN)',
          },
        },
      },
    }),
    ApiWrappedCreatedResponse(
      AuthTokenResponseDto,
      'User signed up successfully',
    ),
    ApiStandardErrorResponses(),
  );

export const LoginSwagger = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Authenticate a user',
      description:
        'Validates email/password credentials and returns a JWT access token.',
    }),
    ApiBody({
      type: LoginDto,
      examples: {
        default: {
          summary: 'Seeded user login',
          value: {
            email: 'taylor.brooks@example.com',
            password: 'Password@123',
          },
        },
        admin: {
          summary: 'Seeded admin (for review approval)',
          value: {
            email: 'admin@example.com',
            password: 'Password@123',
          },
        },
      },
    }),
    ApiWrappedOkResponse(AuthTokenResponseDto, 'User logged in successfully'),
    ApiUnauthorizedResponse({
      description: 'Invalid credentials',
      schema: {
        example: {
          status: false,
          statusCode: 401,
          message: 'Invalid email or password',
          errors: [],
          data: null,
        },
      },
    }),
    ApiStandardErrorResponses(),
  );

export const MeSwagger = () =>
  applyDecorators(
    ApiBearerAuth('bearer'),
    ApiOperation({
      summary: 'Get authenticated user',
      description:
        'Returns the currently authenticated user profile resolved from the JWT token.',
    }),
    ApiWrappedOkResponse(
      AuthUserResponseDto,
      'Authenticated user fetched successfully',
    ),
    ApiUnauthorizedResponse({
      description: 'Missing or invalid JWT token',
      schema: {
        example: {
          status: false,
          statusCode: 401,
          message: 'Unauthorized',
          errors: [],
          data: null,
        },
      },
    }),
    ApiStandardErrorResponses(),
  );

export const RefreshTokenSwagger = () =>
  applyDecorators(
    ApiOperation({ summary: 'Refresh access token' }),
    ApiBody({ type: RefreshTokenDto }),
    ApiWrappedOkResponse(AuthTokenResponseDto, 'Token refreshed successfully'),
    ApiStandardErrorResponses(),
  );

export const LogoutSwagger = () =>
  applyDecorators(
    ApiOperation({ summary: 'Logout and revoke refresh token' }),
    ApiBody({ type: RefreshTokenDto }),
    ApiWrappedOkResponse(Object, 'Logged out successfully'),
    ApiStandardErrorResponses(),
  );

export const VerifyEmailSwagger = () =>
  applyDecorators(
    ApiOperation({ summary: 'Verify email with token' }),
    ApiBody({ type: VerifyEmailDto }),
    ApiWrappedOkResponse(AuthUserResponseDto, 'Email verified successfully'),
    ApiStandardErrorResponses(),
  );

export const ResendVerificationSwagger = () =>
  applyDecorators(
    ApiBearerAuth('bearer'),
    ApiOperation({ summary: 'Resend verification email' }),
    ApiWrappedOkResponse(Object, 'Verification email sent if the account exists'),
    ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' }),
    ApiStandardErrorResponses(),
  );

export const ForgotPasswordSwagger = () =>
  applyDecorators(
    ApiOperation({ summary: 'Request password reset email' }),
    ApiBody({ type: ForgotPasswordDto }),
    ApiWrappedOkResponse(
      Object,
      'Password reset email sent if the account exists',
    ),
    ApiStandardErrorResponses(),
  );

export const ResetPasswordSwagger = () =>
  applyDecorators(
    ApiOperation({ summary: 'Reset password with token' }),
    ApiBody({ type: ResetPasswordDto }),
    ApiWrappedOkResponse(Object, 'Password reset successfully'),
    ApiStandardErrorResponses(),
  );

export const AdminUpdateVerificationSwagger = () =>
  applyDecorators(
    ApiBearerAuth('bearer'),
    ApiOperation({
      summary: 'Admin: update user verification status',
      description: 'Requires admin role.',
    }),
    ApiBody({ type: AdminUpdateVerificationDto }),
    ApiWrappedOkResponse(
      AuthUserResponseDto,
      'User verification status updated',
    ),
    ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' }),
    ApiStandardErrorResponses(),
  );
