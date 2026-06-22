import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

import { IsStrongPassword } from '../../../common/validators/is-strong-password.decorator';

export class ResetPasswordDto {
  @ApiProperty({ description: 'Password reset token from the reset link' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  token: string;

  @ApiProperty({ example: 'your-new-password', minLength: 8 })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(72)
  @IsStrongPassword()
  password: string;
}
