import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class UpdateEmailDto {
  @ApiProperty({ example: 'new.email@example.com' })
  @IsEmail()
  @MaxLength(255)
  email: string;

  @ApiProperty({ example: 'current-password' })
  @IsString()
  @IsNotEmpty()
  password: string;
}
