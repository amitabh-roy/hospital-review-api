import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({ description: 'Opaque refresh token issued at login/signup' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  refreshToken: string;
}
