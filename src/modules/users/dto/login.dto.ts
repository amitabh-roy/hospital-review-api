import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'taylor.brooks@example.com',
    description: 'Registered user email',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'your-password',
    description: 'Plain password used for login',
  })
  @IsString()
  @MinLength(8)
  @MaxLength(72)
  password: string;
}
