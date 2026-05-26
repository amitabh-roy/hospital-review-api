import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

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
    example: 'Password@123',
    minLength: 8,
    description: 'Plain password that will be stored as a bcrypt hash',
  })
  @IsString()
  @MinLength(8)
  @MaxLength(72)
  password: string;

  @ApiProperty({
    example: 1,
    description: 'Role ID from the seeded roles table',
  })
  @IsInt()
  @Min(1)
  roleId: number;
}
