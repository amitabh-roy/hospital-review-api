import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { AuthUserResponseDto } from './auth-user-response.dto';

export class AuthTokenResponseDto {
  @ApiProperty({
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImVtYWlsIjoidGF5bG9yLmJyb29rc0BleGFtcGxlLmNvbSIsInJvbGVJZCI6MSwiaWF0IjoxNzQ4MjM1MDAwLCJleHAiOjE3NDgzMjE0MDB9.signature',
  })
  accessToken: string;

  @ApiProperty({ example: 'Bearer' })
  tokenType: string;

  @ApiProperty({ example: '1d' })
  expiresIn: string;

  @ApiPropertyOptional({
    description:
      'Opaque refresh token; send to POST /auth/refresh and /auth/logout (optional when refresh tokens are disabled).',
  })
  refreshToken?: string;

  @ApiPropertyOptional({ example: '7d' })
  refreshExpiresIn?: string;

  @ApiProperty({ type: AuthUserResponseDto })
  user: AuthUserResponseDto;
}
