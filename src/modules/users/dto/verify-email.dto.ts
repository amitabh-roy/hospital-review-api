import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class VerifyEmailDto {
  @ApiProperty({ description: 'Email verification token from the verification link' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  token: string;
}
