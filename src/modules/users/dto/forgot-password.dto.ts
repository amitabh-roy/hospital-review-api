import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class ForgotPasswordDto {
  @ApiProperty({ example: 'taylor.brooks@example.com' })
  @IsEmail()
  email: string;
}
