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
import { AuthTokenResponseDto } from '../dto/auth-token-response.dto';
import { AuthUserResponseDto } from '../dto/auth-user-response.dto';
import { LoginDto } from '../dto/login.dto';
import { SignupDto } from '../dto/signup.dto';

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
            roleId: 1,
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
