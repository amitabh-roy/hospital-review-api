import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

import { IsStrongPassword } from '../../../common/validators/is-strong-password.decorator';

export class UpdatePasswordDto {
  @ApiProperty({ example: 'current-password' })
  @IsString()
  @IsNotEmpty()
  currentPassword: string;

  @ApiProperty({ example: 'new-secure-password' })
  @IsString()
  @MinLength(8)
  @IsStrongPassword()
  newPassword: string;
}
