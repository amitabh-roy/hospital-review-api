import { ApiProperty } from '@nestjs/swagger';

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

  @ApiProperty({ type: AuthUserResponseDto })
  user: AuthUserResponseDto;
}
