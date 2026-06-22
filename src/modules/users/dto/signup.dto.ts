import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

import { IsStrongPassword } from '../../../common/validators/is-strong-password.decorator';

export class SignupDto {
  @ApiProperty({
    example: 'Taylor Brooks',
    description: 'Full name of the reviewing healthcare professional',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  fullName: string;

  @ApiProperty({
    example: 'taylor.brooks@example.com',
    description: 'Unique email used for authentication',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'your-password',
    minLength: 8,
    description: 'Plain password that will be stored as a bcrypt hash',
  })
  @IsString()
  @MinLength(8)
  @MaxLength(72)
  @IsStrongPassword()
  password: string;

  @ApiProperty({
    example: 'Registered Nurse (RN)',
    description: 'Healthcare occupation selected during signup',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  occupation: string;
}
